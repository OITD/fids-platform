import { Gateway, APIError } from 'encore.dev/api';
import { secret } from 'encore.dev/config';
import { authHandler } from 'encore.dev/auth';
import log from 'encore.dev/log';
import { LRUCache } from 'lru-cache';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { AuthData, AuthParams } from './types';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Secret configuration
const LOGTO_URL = secret('LOGTO_URL');
const LOGTO_APP_API_RESOURCE = secret('LOGTO_APP_API_RESOURCE');

// Add environment configuration validation
const getLogtoConfig = () => {
  const logtoUrl = LOGTO_URL();
  if (!logtoUrl) {
    throw APIError.internal('getLogtoConfig: LOGTO_URL environment variable is missing');
  }

  const apiResourceID = LOGTO_APP_API_RESOURCE();
  if (!apiResourceID) {
    throw APIError.internal('getLogtoConfig: LOGTO_APP_API_RESOURCE environment variable is missing');
  }

  return {
    baseUrl: logtoUrl,
    issuer: `${logtoUrl}/oidc`,
    jwksUrl: `${logtoUrl}/oidc/jwks`,
    apiResourceID,
  };
};

// Cache JWKS for better performance
const jwksCache = new LRUCache<string, ReturnType<typeof createRemoteJWKSet>>({
  max: 1, // We only need to cache one JWKS
  ttl: 1000 * 60 * 60, // 1 hour in milliseconds
  updateAgeOnGet: true, // Reset TTL when accessed
});

const extractJWT = (token: string) => {
  const bearerTokenIdentifier = 'Bearer';

  if (!token.startsWith(bearerTokenIdentifier)) {
    throw APIError.invalidArgument('extractJWT: Authorization token type not supported');
  }

  return token.slice(bearerTokenIdentifier.length + 1);
};

const getJWKS = () => {
  const cacheKey = 'jwks';

  let jwks = jwksCache.get(cacheKey);

  if (!jwks) {
    const config = getLogtoConfig();

    jwks = createRemoteJWKSet(new URL(config.jwksUrl));

    jwksCache.set(cacheKey, jwks);
  }

  return jwks;
};

const decodeJwtPayload = (token: string) => {
  const [, payloadBase64] = token.split('.');

  if (!payloadBase64) {
    throw APIError.invalidArgument('decodeJwtPayload: Invalid token format');
  }

  try {
    const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');

    return JSON.parse(payloadJson);
  } catch (error) {
    if (error instanceof Error) {
      throw APIError.invalidArgument('decodeJwtPayload: Failed to decode token payload', error);
    }
  }

  return {};
};

const verifyJwt = async (token: string | Uint8Array, audience: string) => {
  const config = getLogtoConfig();

  const JWKS = getJWKS();

  const { payload } = await jwtVerify(token, JWKS, {
    issuer: config.issuer,
    audience,
  });

  return payload;
};

// At the user level our 'aud' should match our LOGTO_APP_API_RESOURCE
// While the `aud` (audience) claim in the JWT token follows the format:
// "urn:logto:organization:<organization_id>"
// For example: "urn:logto:organization:123456789"
// This format allows us to extract the organization ID from the token
// by removing the "urn:logto:organization:" prefix
const extractOrganizationId = (aud: any) => {
  const config = getLogtoConfig();

  console.log('extractOrganizationId:', JSON.stringify(aud));
  console.log('config.apiResourceID:', JSON.stringify(config.apiResourceID));

  if (aud === config.apiResourceID) {
    return aud;
  } else if (!aud || typeof aud !== 'string' || !aud.startsWith('urn:logto:organization:')) {
    throw APIError.unauthenticated('Invalid organization token');
  }
  return aud.replace('urn:logto:organization:', '');
};

// The auth handler itself.
export const auth = authHandler<AuthParams, AuthData>(async (params): Promise<AuthData> => {
  const { token } = params;

  if (!token) {
    throw APIError.unauthenticated('Authorization token missing');
  }

  // Check if token type is Bearer and return the JWT portion
  const JWT = extractJWT(token);
  if (!JWT) {
    throw APIError.unauthenticated('Authorization JWT malformed');
  }

  // Dynamically get the audience from the token
  const { aud } = decodeJwtPayload(JWT);
  if (!aud) {
    throw APIError.unauthenticated('Missing audience in token');
  }

  // Verify the token with the audience
  const payload = await verifyJwt(JWT, aud);
  if (!payload.sub) {
    throw APIError.unauthenticated('Missing subject in token');
  }

  // Extract organization ID from the audience claim
  const organizationID = extractOrganizationId(payload.aud);

  log.info(`payload: ${JSON.stringify(payload, null, 2)}`);

  const authData: AuthData = {
    userID: payload.sub,
    clientID: String(payload.client_id),
    organizationID: organizationID,
    // scopes: String(payload.role || ''),
    scopes: String(payload.scope || '')
      .split(' ')
      .filter(Boolean),
  };

  log.info(`Authenticated: ${JSON.stringify(authData, null, 2)}`);

  return authData;
});

// Define the API Gateway that will execute the auth handler:
export const gateway = new Gateway({
  authHandler: auth,
});
