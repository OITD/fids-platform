import { api, APIError } from 'encore.dev/api';
import { getAuthData } from '~encore/auth';
import { logto } from '~encore/clients';
import log from 'encore.dev/log';

import { CreateOrganizationParams, Organization, Role } from './types';
import { LogtoAPIResponse, OrganizationRole, OrganizationUsersResponse } from '../logto/types';

interface CreateOrganizationRequest {
  name: string;
  description?: string;
}

// Create organization endpoint
export const createOrganization = api(
  {
    method: 'POST',
    path: '/organizations',
    auth: true,
  },
  async (params: CreateOrganizationRequest): Promise<Organization> => {
    const auth = getAuthData();
    if (!auth) {
      throw APIError.unauthenticated('User not authenticated');
    }

    try {
      // Create organization using the client import
      const { data: organization }: LogtoAPIResponse<Organization> = await logto.callApi({
        path: '/api/organizations',
        method: 'POST',
        body: JSON.stringify(params),
      });

      if (!organization) {
        throw APIError.internal('Failed to create organization: No organization data returned');
      }

      // Add current user to organization
      await logto.callApi({
        path: `/api/organizations/${organization.id}/users`,
        method: 'POST',
        body: JSON.stringify({
          userIds: [auth.userID],
        }),
      });

      // Get organization roles
      const { data: rolesData }: LogtoAPIResponse<OrganizationRole> = await logto.callApi({
        path: `/api/organization-roles`,
        method: 'GET',
      });

      if (!rolesData) {
        throw APIError.failedPrecondition('Organization roles are missing');
      }

      const roles: Role[] = JSON.parse(rolesData as unknown as string);

      // Find the `Admin` role
      const adminRole = roles.find((role) => role.name === 'admin');
      if (!adminRole) {
        throw APIError.failedPrecondition('Organization admin role is missing');
      }

      await logto.callApi({
        path: `/api/organizations/${organization.id}/users/${auth.userID}/roles`,
        method: 'POST',
        body: JSON.stringify({
          organizationRoleIds: [adminRole.id],
        }),
      });

      const returnPayload = {
        id: organization.id,
        name: organization.name,
        description: organization.description,
      };

      log.debug('Organization created', returnPayload);

      return returnPayload as Organization;
    } catch (error) {
      log.error('Failed to create organization', {
        error: error instanceof Error ? error.message : String(error),
        params,
      });
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal('Failed to create organization');
    }
  },
);
