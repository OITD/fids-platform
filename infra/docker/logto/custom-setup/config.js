import { customAlphabet } from 'nanoid';
import { defaultTenantId } from '@logto/schemas';
// import { Connectors } from '@logto/schemas';

// For IDs (20 chars, lowercase alphanumeric)
const generateId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 20);

// For shorter IDs (12 chars, lowercase alphanumeric)
// const generateShortId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);

// For secrets (32 chars, mixed case alphanumeric)
// const generateSecret = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 32);

// const id = generateId();       // e.g. "n97ofytecm4prbef76lnz"
// const shortId = generateShortId(); // e.g. "j0ui1959vbv9"
// const secret = generateSecret(); // e.g. "PGWiNZdfMvc24XlA8Dk1oAMwNpb4PrrW"

function formatDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  // Get microseconds (JS only provides milliseconds, so pad with extra digits)
  const microseconds = String(date.getUTCMilliseconds()).padStart(3, '0') + '000';

  // Combine all parts
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${microseconds}+00`;
}

const now = new Date();

console.log(' ');
console.log('process.env:', process.env);
console.log(' ');

const TENANT_ID = defaultTenantId || 'default';
console.log(' ');
console.log('TENANT_ID:', TENANT_ID);
console.log(' ');

const APPLICATION_ID_M2M = `${process.env.LOGTO_MANAGEMENT_API_APPLICATION_ID}`;
const APPLICATION_NAME_M2M = 'FIDS HUB';
const APPLICATION_SECRET_M2M = `${process.env.LOGTO_MANAGEMENT_API_APPLICATION_SECRET}`;
const APPLICATION_DESCRIPTION_M2M = 'FIDS M2M';

const APPLICATION_ID_SPA = `${process.env.LOGTO_APP_ID}`;
const APPLICATION_NAME_SPA = `${process.env.APP_NAME}`;
const APPLICATION_SECRET_SPA = `${process.env.LOGTO_APP_SECRET}`;
const APPLICATION_DESCRIPTION_SPA = `${process.env.APP_DESCRIPTION}`;

const CONNECTOR_ID_GOOGLE = `${process.env.CONNECTOR_ID_GOOGLE}`;
const CONNECTOR_CONFIG_SCOPE_GOOGLE = 'openid profile email';
const CONNECTOR_CONFIG_CLIENT_ID_GOOGLE = `${process.env.LOGTO_GOOGLE_CLIENT_ID}`;
const CONNECTOR_CONFIG_CLIENT_SECRET_GOOGLE = `${process.env.LOGTO_GOOGLE_CLIENT_SECRET}`;

const ROLE_M2M_ID = generateId();
const ROLE_M2M_NAME = 'Management API Access';
const ROLE_M2M_DESCRIPTION = 'Role with management API access scope.';

const APPLICATIONS_ROLE_ID_M2M = generateId();
const ROLES_SCOPE_ID_M2M = generateId();
const ROLES_SCOPE_SCOPE_ID_M2M = 'management-api-all';

const SIGN_IN_EXPERIENCE_ID = 'default';
const SIGN_IN_EXPERIENCE_BRANDING_LOGO_URL = `${process.env.APP_URL}/logo.png`;
const SIGN_IN_EXPERIENCE_BRANDING_DARK_LOGO_URL = `${process.env.APP_URL}/logo-dark.png`;
const SIGN_IN_EXPERIENCE_TERMS_OF_USE_URL = `${process.env.APP_URL}/terms-of-service.html`;
const SIGN_IN_EXPERIENCE_PRIVACY_POLICY_URL = `${process.env.APP_URL}/privacy-policy.html`;

const SSO_CONNECTOR_ID_GOOGLE = `${process.env.SSO_CONNECTOR_ID_GOOGLE}`;
const SSO_CONNECTOR_NAME_GOOGLE = 'OITD Google Workspace Connector';
const SSO_CONNECTOR_CONFIG_SCOPE_GOOGLE = 'openid profile email';
const SSO_CONNECTOR_CONFIG_CLIENT_ID_GOOGLE = `${process.env.LOGTO_GOOGLE_WORKSPACE_CLIENT_ID}`;
const SSO_CONNECTOR_CONFIG_CLIENT_SECRET_GOOGLE = `${process.env.LOGTO_GOOGLE_WORKSPACE_CLIENT_SECRET}`;
const SSO_CONNECTOR_DOMAINS_GOOGLE = JSON.parse(process.env.DOMAINS || '[]');
const SSO_CONNECTOR_BRANDING_DISPLAY_NAME_GOOGLE = 'OITD Workspace';

const RESOURCE_ID = generateId();
const RESOURCE_NAME = `${process.env.APP_NAME} API Resource Identifier`;
const RESOURCE_INDICATOR = `${process.env.LOGTO_APP_API_RESOURCE}`;

const ORGANIZATION_ROLE_ID_ADMIN = generateId();
const ORGANIZATION_ROLE_NAME_ADMIN = 'admin';
const ORGANIZATION_ROLE_DESCRIPTION_ADMIN = 'Admin Role';

const ORGANIZATION_ROLE_ID_EDITOR = generateId();
const ORGANIZATION_ROLE_NAME_EDITOR = 'editor';
const ORGANIZATION_ROLE_DESCRIPTION_EDITOR = 'Editor Role';

const ORGANIZATION_ROLE_ID_MEMBER = generateId();
const ORGANIZATION_ROLE_NAME_MEMBER = 'member';
const ORGANIZATION_ROLE_DESCRIPTION_MEMBER = 'Member Role';

const ORGANIZATION_SCOPE_RESOURCE_CREATE_ID = generateId();
const ORGANIZATION_SCOPE_RESOURCE_CREATE_NAME = 'create:resources';
const ORGANIZATION_SCOPE_RESOURCE_CREATE_DESCRIPTION = 'Create Resources';

const ORGANIZATION_SCOPE_RESOURCE_READ_ID = generateId();
const ORGANIZATION_SCOPE_RESOURCE_READ_NAME = 'read:resources';
const ORGANIZATION_SCOPE_RESOURCE_READ_DESCRIPTION = 'Read Resources';

const ORGANIZATION_SCOPE_RESOURCE_EDIT_ID = generateId();
const ORGANIZATION_SCOPE_RESOURCE_EDIT_NAME = 'edit:resources';
const ORGANIZATION_SCOPE_RESOURCE_EDIT_DESCRIPTION = 'Edit Resources';

const ORGANIZATION_SCOPE_RESOURCE_DELETE_ID = generateId();
const ORGANIZATION_SCOPE_RESOURCE_DELETE_NAME = 'delete:resources';
const ORGANIZATION_SCOPE_RESOURCE_DELETE_DESCRIPTION = 'Delete Resources';


export const config = {
  applications: [
    {
      tenantId: TENANT_ID,
      id: APPLICATION_ID_M2M,
      name: APPLICATION_NAME_M2M,
      secret: APPLICATION_SECRET_M2M,
      description: APPLICATION_DESCRIPTION_M2M,
      type: 'MachineToMachine',
      oidcClientMetadata: {
        redirectUris: [],
        postLogoutRedirectUris: [],
      },
      customClientMetadata: {},
      protectedAppMetadata: null,
      isThirdParty: false,
      createdAt: formatDate(now),
    },
    {
      tenantId: TENANT_ID,
      id: APPLICATION_ID_SPA,
      name: APPLICATION_NAME_SPA,
      secret: APPLICATION_SECRET_SPA,
      description: APPLICATION_DESCRIPTION_SPA,
      type: 'SPA',
      oidcClientMetadata: {
        redirectUris: [`https://${process.env.APP_URI}/callback`, `https://${process.env.APP_URI}`, `${process.env.APP_URL}/callback`, `${process.env.APP_URL}`],
        postLogoutRedirectUris: [`https://${process.env.APP_URI}`, `${process.env.APP_URL}`],
      },
      customClientMetadata: {
        idTokenTtl: 3600,
        corsAllowedOrigins: [],
        rotateRefreshToken: true,
        refreshTokenTtlInDays: 7,
        alwaysIssueRefreshToken: false,
      },
      protectedAppMetadata: null,
      isThirdParty: false,
      createdAt: formatDate(now),
    },
  ],

  connectors: [
    {
      tenantId: TENANT_ID,
      id: CONNECTOR_ID_GOOGLE,
      connectorId: 'google-universal',
      config: {
        scope: CONNECTOR_CONFIG_SCOPE_GOOGLE,
        clientId: CONNECTOR_CONFIG_CLIENT_ID_GOOGLE,
        clientSecret: CONNECTOR_CONFIG_CLIENT_SECRET_GOOGLE
      },
      syncProfile: false,
      metadata: {},
      createdAt: formatDate(now),
    }
  ],

  sso_connectors: [
    {
      tenantId: TENANT_ID,
      id: SSO_CONNECTOR_ID_GOOGLE,
      provider_name: 'GoogleWorkspace',
      connector_name: SSO_CONNECTOR_NAME_GOOGLE,
      config: {
        scope: SSO_CONNECTOR_CONFIG_SCOPE_GOOGLE,
        clientId: SSO_CONNECTOR_CONFIG_CLIENT_ID_GOOGLE,
        clientSecret: SSO_CONNECTOR_CONFIG_CLIENT_SECRET_GOOGLE,
      },
      domains: SSO_CONNECTOR_DOMAINS_GOOGLE,
      branding: {
        displayName: SSO_CONNECTOR_BRANDING_DISPLAY_NAME_GOOGLE,
      },
      sync_profile: false,
      created_at: formatDate(now),
    },
  ],

  sign_in_experiences: [
    {
      tenantId: TENANT_ID,
      id: SIGN_IN_EXPERIENCE_ID,
      color: {
        primaryColor: '#0053db',
        darkPrimaryColor: '#0072f0',
        isDarkModeEnabled: true,
      },
      branding: {
        logoUrl: SIGN_IN_EXPERIENCE_BRANDING_LOGO_URL,
        darkLogoUrl: SIGN_IN_EXPERIENCE_BRANDING_DARK_LOGO_URL,
      },
      language_info: {
        autoDetect: true,
        fallbackLanguage: 'en',
      },
      terms_of_use_url: SIGN_IN_EXPERIENCE_TERMS_OF_USE_URL,
      privacy_policy_url: SIGN_IN_EXPERIENCE_PRIVACY_POLICY_URL,
      sign_in: {
        methods: [],
      },
      sign_up: {
        verify: false,
        password: false,
        identifiers: [],
      },
      social_sign_in_connector_targets: ["google"],
      sign_in_mode: 'SignInAndRegister',
      custom_css: `[aria-label*="Logto"] { display: none; }`,
      custom_content: {},
      password_policy: {
        length: {
          max: 256,
          min: 8,
        },
        rejects: {
          pwned: true,
          words: [],
          userInfo: true,
          repetitionAndSequence: true,
        },
        characterTypes: {
          min: 1,
        },
      },
      mfa: {
        policy: 'UserControlled',
        factors: [],
      },
      single_sign_on_enabled: true,
    },
  ],

  roles: [
    {
      tenantId: TENANT_ID,
      id: ROLE_M2M_ID,
      name: ROLE_M2M_NAME,
      description: ROLE_M2M_DESCRIPTION,
      type: 'MachineToMachine',
    }
  ],

  applications_roles: [
    {
      tenantId: TENANT_ID,
      id: APPLICATIONS_ROLE_ID_M2M,
      application_id: APPLICATION_ID_M2M,
      role_id: ROLE_M2M_ID,
    },
  ],

  roles_scopes: [
    {
      tenantId: TENANT_ID,
      id: ROLES_SCOPE_ID_M2M,
      role_id: ROLE_M2M_ID,
      scope_id: ROLES_SCOPE_SCOPE_ID_M2M,
    },
  ],

  resources: [
    {
      tenantId: TENANT_ID,
      id: RESOURCE_ID,
      name: RESOURCE_NAME,
      indicator: RESOURCE_INDICATOR,
      is_default: false,
      access_token_ttl: 3600,
    },
  ],

  scopes: [],

  organizations: [],

  organization_roles: [
    {
      tenantId: TENANT_ID,
      id: ORGANIZATION_ROLE_ID_ADMIN,
      name: ORGANIZATION_ROLE_NAME_ADMIN,
      description: ORGANIZATION_ROLE_DESCRIPTION_ADMIN,
    },
    {
      tenantId: TENANT_ID,
      id: ORGANIZATION_ROLE_ID_EDITOR,
      name: ORGANIZATION_ROLE_NAME_EDITOR,
      description: ORGANIZATION_ROLE_DESCRIPTION_EDITOR,
    },
    {
      tenantId: TENANT_ID,
      id: ORGANIZATION_ROLE_ID_MEMBER,
      name: ORGANIZATION_ROLE_NAME_MEMBER,
      description: ORGANIZATION_ROLE_DESCRIPTION_MEMBER,
    },
  ],

  organization_scopes: [
    {
      tenantId: TENANT_ID,
      id: ORGANIZATION_SCOPE_RESOURCE_CREATE_ID,
      name: ORGANIZATION_SCOPE_RESOURCE_CREATE_NAME,
      description: ORGANIZATION_SCOPE_RESOURCE_CREATE_DESCRIPTION,
    },
    {
      tenantId: TENANT_ID,
      id: ORGANIZATION_SCOPE_RESOURCE_READ_ID,
      name: ORGANIZATION_SCOPE_RESOURCE_READ_NAME,
      description: ORGANIZATION_SCOPE_RESOURCE_READ_DESCRIPTION,
    },
    {
      tenantId: TENANT_ID,
      id: ORGANIZATION_SCOPE_RESOURCE_EDIT_ID,
      name: ORGANIZATION_SCOPE_RESOURCE_EDIT_NAME,
      description: ORGANIZATION_SCOPE_RESOURCE_EDIT_DESCRIPTION,
    },
    {
      tenantId: TENANT_ID,
      id: ORGANIZATION_SCOPE_RESOURCE_DELETE_ID,
      name: ORGANIZATION_SCOPE_RESOURCE_DELETE_NAME,
      description: ORGANIZATION_SCOPE_RESOURCE_DELETE_DESCRIPTION,
    },
  ],

  organization_role_scope_relations: [
    {
      tenantId: TENANT_ID,
      organization_role_id: ORGANIZATION_ROLE_ID_ADMIN,
      organization_scope_id: ORGANIZATION_SCOPE_RESOURCE_CREATE_ID,
    },
    {
      tenantId: TENANT_ID,
      organization_role_id: ORGANIZATION_ROLE_ID_ADMIN,
      organization_scope_id: ORGANIZATION_SCOPE_RESOURCE_READ_ID,
    },
    {
      tenantId: TENANT_ID,
      organization_role_id: ORGANIZATION_ROLE_ID_ADMIN,
      organization_scope_id: ORGANIZATION_SCOPE_RESOURCE_EDIT_ID,
    },
    {
      tenantId: TENANT_ID,
      organization_role_id: ORGANIZATION_ROLE_ID_ADMIN,
      organization_scope_id: ORGANIZATION_SCOPE_RESOURCE_DELETE_ID,
    },
    {
      tenantId: TENANT_ID,
      organization_role_id: ORGANIZATION_ROLE_ID_EDITOR,
      organization_scope_id: ORGANIZATION_SCOPE_RESOURCE_CREATE_ID,
    },
    {
      tenantId: TENANT_ID,
      organization_role_id: ORGANIZATION_ROLE_ID_EDITOR,
      organization_scope_id: ORGANIZATION_SCOPE_RESOURCE_READ_ID,
    },
    {
      tenantId: TENANT_ID,
      organization_role_id: ORGANIZATION_ROLE_ID_EDITOR,
      organization_scope_id: ORGANIZATION_SCOPE_RESOURCE_EDIT_ID,
    },
    {
      tenantId: TENANT_ID,
      organization_role_id: ORGANIZATION_ROLE_ID_MEMBER,
      organization_scope_id: ORGANIZATION_SCOPE_RESOURCE_READ_ID,
    },
  ],
};
