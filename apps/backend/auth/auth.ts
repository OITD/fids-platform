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
  // Split token into parts
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw APIError.invalidArgument('decodeJwtPayload: Invalid JWT format - token must have 3 parts');
  }

  const [, payloadBase64] = parts;

  try {
    // Add padding if needed
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64;

    const payloadJson = Buffer.from(paddedBase64, 'base64').toString('utf-8');
    return JSON.parse(payloadJson);
  } catch (error) {
    if (error instanceof Error) {
      throw APIError.invalidArgument(`decodeJwtPayload: Failed to decode token payload: ${error.message}`);
    }
    throw APIError.invalidArgument('decodeJwtPayload: Failed to decode token payload');
  }
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

const isJWT = (token: string): boolean => {
  // Simple check if the token contains two dots (three parts)
  return token.split('.').length === 3;
};

const getFetchOptions = (headers: Record<string, string>) => {
  const options: RequestInit = {
    headers,
  };

  return options;
};

// The auth handler itself.
export const auth = authHandler<AuthParams, AuthData>(async (params): Promise<AuthData> => {
  const { token } = params;

  if (!token) {
    throw APIError.unauthenticated('Authorization token missing');
  }

  log.debug('Received token', { token: token.substring(0, 20) + '...' });

  // Check if token type is Bearer and return the token portion
  const cleanToken = extractJWT(token);
  if (!cleanToken) {
    throw APIError.unauthenticated('Authorization token malformed');
  }

  // Handle both JWT and regular access tokens
  if (isJWT(cleanToken)) {
    // Handle JWT (organization) token
    const { aud } = decodeJwtPayload(cleanToken);
    if (!aud) {
      throw APIError.unauthenticated('Missing audience in token');
    }

    const payload = await verifyJwt(cleanToken, aud);
    if (!payload.sub) {
      throw APIError.unauthenticated('Missing subject in token');
    }

    const organizationID = extractOrganizationId(payload.aud);

    return {
      userID: payload.sub,
      clientID: String(payload.client_id),
      organizationID: organizationID,
      scopes: String(payload.scope || '')
        .split(' ')
        .filter(Boolean),
    };
  } else {
    // Handle regular access token
    try {
      const config = getLogtoConfig();
      const userInfoUrl = `${config.baseUrl}/oidc/me`;

      log.debug('Fetching user info', { url: userInfoUrl });

      const response = await fetch(
        userInfoUrl,
        getFetchOptions({
          Authorization: `Bearer ${cleanToken}`,
          Accept: 'application/json',
        }),
      );

      const responseText = await response.text();
      log.debug('UserInfo response', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch userinfo: ${response.status} ${response.statusText}`);
      }

      let userInfo;
      try {
        userInfo = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid JSON response from userinfo endpoint: ${responseText}`);
      }

      if (!userInfo.sub) {
        throw new Error('Missing sub claim in userinfo response');
      }

      log.debug('Parsed user info', { userInfo });

      return {
        userID: userInfo.sub,
        clientID: userInfo.client_id || '',
        organizationID: '', // Empty for regular access tokens
        scopes: String(userInfo.scope || '')
          .split(' ')
          .filter(Boolean),
      };
    } catch (error) {
      log.error('Failed to verify access token', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Throw a more specific error message
      throw APIError.unauthenticated(`Failed to verify access token: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
});

// Define the API Gateway that will execute the auth handler:
export const gateway = new Gateway({
  authHandler: auth,
});
