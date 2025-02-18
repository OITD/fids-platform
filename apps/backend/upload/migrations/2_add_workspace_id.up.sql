-- Add workspace_id column to files table
ALTER TABLE files
ADD COLUMN workspace_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- Create index for workspace_id
CREATE INDEX IF NOT EXISTS files_workspace_id_idx ON files(workspace_id);

-- Update unique constraint
ALTER TABLE files 
DROP CONSTRAINT IF EXISTS files_name_organization_id_key,
ADD CONSTRAINT files_name_organization_id_workspace_id_key UNIQUE (name, organization_id, workspace_id);

-- Remove the default value after all existing rows have been updated
ALTER TABLE files
ALTER COLUMN workspace_id DROP DEFAULT; 