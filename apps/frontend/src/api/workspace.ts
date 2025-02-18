import { useCallback } from 'react';
import { useLogto } from '@logto/react';
import getRequestClient from '../lib/get-request-client';
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
  const { getOrganizationToken } = useLogto();

  return {
    getWorkspaces: useCallback(
      async (organizationId: string): Promise<Types.auth.Workspace[]> => {
        const token = await getOrganizationToken(organizationId);
        if (!token) throw new Error('User is not a member of the organization');

        const client = getRequestClient(token);
        const response = await client.workspace.getAll();
        return response.workspaces;
      },
      [getOrganizationToken],
    ),

    getWorkspace: useCallback(
      async (orgId: string, workspaceId: string): Promise<Types.auth.Workspace> => {
        const token = await getOrganizationToken(orgId);
        if (!token) throw new Error('User is not a member of the organization');

        const client = getRequestClient(token);
        const response = await client.workspace.getOne({ id: workspaceId });
        return response.workspace;
      },
      [getOrganizationToken],
    ),

    createWorkspace: useCallback(
      async (orgId: string, params: Types.auth.CreateWorkspaceParams): Promise<Types.auth.Workspace> => {
        const token = await getOrganizationToken(orgId);
        if (!token) throw new Error('User is not a member of the organization');

        const client = getRequestClient(token);
        const response = await client.workspace.createOne(params);
        return response.workspace;
      },
      [getOrganizationToken],
    ),

    updateWorkspace: useCallback(
      async (orgId: string, workspaceId: string, data: Types.auth.UpdateWorkspaceParams) => {
        const token = await getOrganizationToken(orgId);
        if (!token) throw new Error('User is not a member of the organization');

        const client = getRequestClient(token);
        const response = await client.workspace.updateOne({ id: workspaceId, ...data });
        return response.workspace;
      },
      [getOrganizationToken],
    ),

    deleteWorkspace: useCallback(
      async (orgId: string, workspaceId: string): Promise<void> => {
        const token = await getOrganizationToken(orgId);
        if (!token) throw new Error('User is not a member of the organization');

        const client = getRequestClient(token);
        await client.workspace.deleteOne({ id: workspaceId });
      },
      [getOrganizationToken],
    ),
  };
};
