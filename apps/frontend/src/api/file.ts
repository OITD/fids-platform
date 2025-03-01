import { useCallback } from 'react';
import { useLogto } from '@logto/react';

import getRequestClient from '~/lib/get-request-client';
import { upload } from '~/lib/client';
import { useApi } from '~/api/base';

import FileMetadata = upload.FileMetadata;

export type { FileMetadata };

export const useFileApi = () => {
  const { fetchWithToken } = useApi();
  const { getOrganizationToken } = useLogto();

  return {
    listFiles: useCallback(
      async (orgId: string, workspaceId: string): Promise<FileMetadata[]> => {
        const token = await getOrganizationToken(orgId);
        if (!token) throw new Error('User is not a member of the organization');

        const client = getRequestClient(token);
        const response = await client.upload.getAll(workspaceId);
        return response.files;
      },
      [getOrganizationToken],
    ),

    uploadFile: useCallback(
      async (orgId: string, workspaceId: string, formData: FormData): Promise<FileMetadata> => {
        const token = await getOrganizationToken(orgId);
        if (!token) throw new Error('User is not a member of the organization');

        const headers = new Headers();
        // Let the browser set the boundary in the content-type
        // Don't set content-type manually as it needs the boundary parameter

        const response = await fetchWithToken(
          `/upload/${workspaceId}`,
          {
            method: 'POST',
            body: formData,
            headers,
            // This is important - don't try to set the content-type header
            skipContentType: true,
            // This is also important - don't try to JSON.stringify the body
            rawBody: true,
          },
          orgId,
        );

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(error.message || 'Upload failed');
        }
      },
      [fetchWithToken],
    ),

    deleteFile: useCallback(
      async (fileName: string, orgId: string, workspaceId: string): Promise<void> => {
        const token = await getOrganizationToken(orgId);
        if (!token) throw new Error('User is not a member of the organization');

        const client = getRequestClient(token);
        await client.upload.deleteOne(workspaceId, fileName);
      },
      [getOrganizationToken],
    ),
  };
};
