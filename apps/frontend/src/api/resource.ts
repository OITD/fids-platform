import { useMemo } from 'react';
import { useLogto } from '@logto/react';

import { useApi } from './base';

export type Organization = {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
  role?: string;
};

export interface CreateOrganizationParams {
  name: string;
  description?: string;
}

export const useResourceApi = () => {
  const { fetchWithToken } = useApi();
  const { getOrganizationToken, getOrganizationTokenClaims } = useLogto();

  return useMemo(
    () => ({
      createOrganization: async (params: CreateOrganizationParams): Promise<Organization> => {
        const response = await fetchWithToken(
          '/organizations',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: params,
          },
          undefined,
        );

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(error.message || 'Failed to create organization');
        }

        return response.json();
      },

      getUserOrganizationScopes: async (organizationId: string): Promise<string[]> => {
        const organizationToken = await getOrganizationToken(organizationId);

        if (!organizationToken) {
          throw new Error('User is not a member of the organization');
        }

        const tokenClaims = await getOrganizationTokenClaims(organizationId);

        // This ensures scope is treated as a string before splitting it, and filter(Boolean) removes any empty strings.
        const scopes = String(tokenClaims?.scope || '')
          .split(' ')
          .filter(Boolean);

        return scopes;
      },
    }),
    [fetchWithToken, getOrganizationToken, getOrganizationTokenClaims],
  );
};
