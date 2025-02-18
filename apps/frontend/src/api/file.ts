import { useMemo } from 'react';
import { useLogto } from '@logto/react';
import { useApi } from './base';

export interface FileInfo {
  name: string;
  url: string;
}

export const useFileApi = () => {
  const { fetchWithToken } = useApi();
  const { getOrganizationToken } = useLogto();

  return useMemo(
    () => ({
      listFiles: async (orgId: string, workspaceId: string): Promise<FileInfo[]> => {
        const response = await fetchWithToken(
          `/files/${workspaceId}`,
          {
            method: 'GET',
          },
          orgId,
        );

        const data = await response.json();
        return data.files;
      },

      uploadFile: async (orgId: string, workspaceId: string, formData: FormData): Promise<void> => {
        const headers = new Headers();
        // Let the browser set the boundary in the content-type
        // Don't set content-type manually as it needs the boundary parameter

        const response = await fetchWithToken(
          `/upload/${workspaceId}`,
          {
            method: 'POST',
            body: formData,
            headers,
            skipContentType: true,
            rawBody: true,
          },
          orgId,
        );

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(error.message || 'Upload failed');
        }
      },

      deleteFile: async (fileName: string, orgId: string, workspaceId: string): Promise<void> => {
        const response = await fetchWithToken(
          `/files/${workspaceId}/${encodeURIComponent(fileName)}`,
          {
            method: 'DELETE',
          },
          orgId,
        );

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(error.message || 'Failed to delete file');
        }
      },
    }),
    [fetchWithToken],
  );
};
