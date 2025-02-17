DROP TABLE IF EXISTS files;

CREATE TABLE files (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    mime_type TEXT,
    uploaded_by TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    data BYTEA,  -- For storing file data if needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, organization_id)
);

CREATE INDEX files_organization_id_idx ON files(organization_id); 