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
      listFiles: async (orgId: string): Promise<FileInfo[]> => {
        const [dbResponse, bucketResponse] = await Promise.all([
          fetchWithToken(
            '/db-files',
            {
              method: 'GET',
            },
            orgId,
          ),
          fetchWithToken(
            '/bucket-files',
            {
              method: 'GET',
            },
            orgId,
          ),
        ]);

        const [dbFiles, bucketFiles] = await Promise.all([dbResponse.json(), bucketResponse.json()]);

        // Combine and deduplicate files
        const allFiles = [...dbFiles.files, ...bucketFiles.files];
        return allFiles.reduce((acc: FileInfo[], file) => {
          if (!acc.find((f) => f.name === file.name)) {
            acc.push(file);
          }
          return acc;
        }, []);
      },

      uploadFile: async (orgId: string, formData: FormData): Promise<void> => {
        const headers = new Headers();
        // Let the browser set the boundary in the content-type
        // Don't set content-type manually as it needs the boundary parameter

        const response = await fetchWithToken(
          '/upload',
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

      deleteFile: async (fileName: string, orgId: string): Promise<void> => {
        const response = await fetchWithToken(
          `/files/${encodeURIComponent(fileName)}`,
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
    [fetchWithToken, getOrganizationToken],
  );
};
