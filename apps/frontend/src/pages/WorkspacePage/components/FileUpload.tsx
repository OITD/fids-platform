import { useState } from 'react';
import { useParams } from 'react-router';
import { useWorkspaceApi } from '~/api/workspace';

interface FileUploadProps {
  onUploadComplete: () => void;
}

export const FileUpload = ({ onUploadComplete }: FileUploadProps) => {
  const { orgId } = useParams();
  const { uploadFile } = useWorkspaceApi();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!orgId) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    setIsUploading(true);
    setError(null);

    try {
      await uploadFile(orgId, formData);
      onUploadComplete();
      form.reset();
    } catch (err) {
      setError(`Failed to upload file: ${err}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <div>
          <label htmlFor="filefield" className="block text-sm font-medium text-gray-700 mb-1">
            Upload File
          </label>
          <input
            type="file"
            id="filefield"
            name="filefield"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              cursor-pointer"
          />
        </div>

        {error && <div className="text-red-600 text-sm bg-red-50 px-4 py-2.5 rounded-lg">{error}</div>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 transition-colors duration-200 ease-in-out"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </form>
    </div>
  );
};
