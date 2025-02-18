-- Remove the workspace_id constraints and column
ALTER TABLE files
DROP CONSTRAINT IF EXISTS files_name_organization_id_workspace_id_key,
ADD CONSTRAINT files_name_organization_id_key UNIQUE (name, organization_id);

DROP INDEX IF EXISTS files_workspace_id_idx;

ALTER TABLE files
DROP COLUMN workspace_id; 