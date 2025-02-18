import { useLogto } from '@logto/react';
import { useCallback } from 'react';
import Client from '../lib/client';
import getRequestClient from '../lib/get-request-client';

import { APP_ENV } from '../env';

const API_BASE_URL = APP_ENV.api.baseUrl;
const APP_API_RESOURCE_INDICATOR = APP_ENV.api.resourceIndicator;

export class ApiRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

interface FetchOptions extends RequestInit {
  skipContentType?: boolean;
  rawBody?: boolean;
}

export const useApi = () => {
  const { getAccessToken, getOrganizationToken } = useLogto();

  const getClient = useCallback(async (organizationId?: string): Promise<Client> => {
    let token: string | undefined;

    if (organizationId) {
      token = await getOrganizationToken(organizationId);
    } else {
      token = await getAccessToken();
    }

    if (!token) {
      throw new Error(organizationId ? 'User is not a member of the organization' : 'Failed to get access token');
    }

    return getRequestClient(token);
  }, [getAccessToken, getOrganizationToken]);

  const fetchWithToken = useCallback(
    async (path: string, options: FetchOptions = {}, organizationId?: string) => {
      try {
        const client = await getClient(organizationId);

        const adminData = await client.admin.getDashboardData();

        const headers = new Headers(options.headers);

        if (!options.skipContentType) {
          headers.set('Content-Type', 'application/json');
        }

        headers.set('Authorization', `Bearer ${token}`);

        if (organizationId) {
          headers.set('Organization-Id', organizationId);
        }

        let body = options.body;
        if (body && !options.rawBody && !(body instanceof FormData)) {
          if (typeof body === 'string') {
            // If it's already a string, assume it's already JSON
            body = JSON.parse(body);
          }
          body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}${path}`, {
          ...options,
          headers,
          body,
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: response.statusText }));
          throw new ApiRequestError(error.message || 'Request failed', response.status);
        }

        return response;
      } catch (error) {
        if (error instanceof ApiRequestError) {
          throw error;
        }
        throw new ApiRequestError(error instanceof Error ? error.message : String(error));
      }
    },
    [getAccessToken, getOrganizationToken],
  );

  return { getClient, fetchWithToken };
};
