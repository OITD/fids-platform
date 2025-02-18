import { useCallback } from 'react';
import { useLogto } from '@logto/react';

import getRequestClient from '../lib/get-request-client';
import { organization } from '../lib/client';

import Organization = organization.Organization;
import CreateOrganizationParams = organization.CreateOrganizationParams;
import { OrganizationData } from '~/types/organization';

export const useResourceApi = () => {
  const { getAccessToken, getOrganizationToken, getOrganizationTokenClaims, fetchUserInfo } = useLogto();

  return {
    createOrganization: useCallback(
      async (params: CreateOrganizationParams): Promise<Organization> => {
        const token = await getAccessToken();
        if (!token) throw new Error('User not authenticated');

        const client = getRequestClient(token);
        const response = await client.organization.createOne(params);

        console.log('createOrganization response', response);

        return response.organization;
      },
      [getAccessToken],
    ),

    getOrganizations: useCallback(async (): Promise<Organization[]> => {
      const token = await getAccessToken();
      if (!token) throw new Error('User not authenticated');

      const userInfo = await fetchUserInfo();
      const organizationData = (userInfo?.organization_data || []) as OrganizationData[];

      console.log('getOrganizations response', organizationData);

      return organizationData;
    }, [getAccessToken, fetchUserInfo]),

    getUserOrganizationScopes: useCallback(
      async (organizationId: string): Promise<string[]> => {
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
      [getAccessToken, getOrganizationToken, getOrganizationTokenClaims],
    ),
  };
};
