import { useCallback } from 'react';
import { useLogto } from '@logto/react';

import { workspace } from '~/lib/client';
import getRequestClient from '~/lib/get-request-client';

import CreateWorkspaceParams = workspace.CreateWorkspaceRequest;
import GetWorkspaceParams = workspace.GetWorkspaceRequest;
import UpdateWorkspaceParams = workspace.UpdateWorkspaceRequest;
import Workspace = workspace.Workspace;

export type { Workspace };

export const useWorkspaceApi = () => {
  const { getOrganizationToken } = useLogto();

  return {
    getWorkspaces: useCallback(
      async (organizationId: string): Promise<Workspace[]> => {
        const token = await getOrganizationToken(organizationId);
        if (!token) throw new Error('User is not a member of the organization');

        const client = getRequestClient(token);
        const response = await client.workspace.getAll();
        return response.workspaces;
      },
      [getOrganizationToken],
    ),

    getWorkspace: useCallback(
      async (orgId: string, workspaceId: string): Promise<Workspace> => {
        const token = await getOrganizationToken(orgId);
        if (!token) throw new Error('User is not a member of the organization');

        const client = getRequestClient(token);
        const response = await client.workspace.getOne(workspaceId);
        return response.workspace;
      },
      [getOrganizationToken],
    ),

    createWorkspace: useCallback(
      async (orgId: string, params: CreateWorkspaceParams): Promise<Workspace> => {
        const token = await getOrganizationToken(orgId);
        if (!token) throw new Error('User is not a member of the organization');

        const client = getRequestClient(token);
        const response = await client.workspace.createOne(params);
        return response.workspace;
      },
      [getOrganizationToken],
    ),

    updateWorkspace: useCallback(
      async (orgId: string, workspaceId: string, data: UpdateWorkspaceParams) => {
        const token = await getOrganizationToken(orgId);
        if (!token) throw new Error('User is not a member of the organization');

        const client = getRequestClient(token);
        const response = await client.workspace.updateOne(workspaceId, data);
        return response.workspace;
      },
      [getOrganizationToken],
    ),

    deleteWorkspace: useCallback(
      async (orgId: string, workspaceId: string): Promise<void> => {
        const token = await getOrganizationToken(orgId);
        if (!token) throw new Error('User is not a member of the organization');

        const client = getRequestClient(token);
        await client.workspace.deleteOne(workspaceId);
      },
      [getOrganizationToken],
    ),
  };
};
