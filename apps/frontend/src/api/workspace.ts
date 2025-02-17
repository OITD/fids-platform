import { useMemo } from 'react';

import { useApi } from './base';
import type * as Types from '~encore/clients';

export interface Workspace {
  id: string;
  title: string;
  preview: string;
  content: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CreateWorkspaceParams {
  title: string;
  content: string;
}

export interface GetWorkspaceResponse {
  workspace: Workspace;
}

export const useWorkspaceApi = () => {
  const { fetchWithToken } = useApi();

  return useMemo(
    () => ({
      getWorkspaces: async (organizationId: string): Promise<Types.auth.Workspace[]> => {
        const response = await fetchWithToken(
          '/workspaces',
          {
            method: 'GET',
          },
          organizationId,
        );

        const data = await response.json();
        return data.workspaces;
      },

      getWorkspace: async (orgId: string, workspaceId: string): Promise<GetWorkspaceResponse> => {
        const response = await fetchWithToken(
          `/workspace/${workspaceId}`,
          {
            method: 'GET',
          },
          orgId,
        );

        const data = await response.json();
        return data.workspace;
      },

      createWorkspace: async (orgId: string, params: CreateWorkspaceParams): Promise<Workspace> => {
        const response = await fetchWithToken(
          '/workspaces',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: params,
          },
          orgId,
        );

        const data = await response.json();
        return data.workspace;
      },

      updateWorkspace: async (
        orgId: string,
        workspaceId: string,
        data: { title?: string; content?: string },
      ): Promise<Workspace> => {
        const response = await fetchWithToken(
          `/workspace/${workspaceId}`,
          {
            method: 'PUT',
            body: JSON.stringify(data),
          },
          orgId,
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to update workspace');
        }

        const result = await response.json();
        return result.workspace;
      },

      deleteWorkspace: async (orgId: string, workspaceId: string): Promise<void> => {
        const response = await fetchWithToken(
          `/workspace/${workspaceId}`,
          {
            method: 'DELETE',
          },
          orgId,
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to delete workspace');
        }
      },
    }),
    [fetchWithToken],
  );
};
