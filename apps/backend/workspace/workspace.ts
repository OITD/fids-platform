import { api, APIError } from 'encore.dev/api';
import { getAuthData } from '~encore/auth';
import { SQLDatabase } from 'encore.dev/storage/sqldb';

import type {
  Workspace,
  CreateWorkspaceRequest,
  CreateWorkspaceResponse,
  AuthData,
  UpdateWorkspaceRequest,
  UpdateWorkspaceResponse,
  DeleteWorkspaceResponse,
} from './types';

// Initialize database
export const DB = new SQLDatabase('workspaces', {
  migrations: './migrations',
});

// Get single workspace endpoint
export const getWorkspace = api(
  {
    method: 'GET',
    path: '/workspace/:id',
    auth: true,
  },
  async (params: { id: string }): Promise<Workspace & { content: string }> => {
    const auth = getAuthData() as AuthData;

    const row = await DB.queryRow<Workspace & { content: string }>`
      SELECT
        id,
        title,
        content,
        preview,
        updated_at as "updatedAt",
        updated_by as "updatedBy"
      FROM workspaces
      WHERE id = ${params.id}
      AND organization_id = ${auth.organizationID}
    `;

    if (!row) {
      throw APIError.notFound('Workspace not found');
    }

    return row;
  },
);

// List workspaces endpoint
export const listWorkspaces = api(
  {
    method: 'GET',
    path: '/workspaces',
    auth: true,
  },
  async (): Promise<{ workspaces: Workspace[] }> => {
    const auth = getAuthData() as AuthData;

    const rows = await DB.query<Workspace>`
      SELECT
        id,
        title,
        content,
        preview,
        updated_at as "updatedAt",
        updated_by as "updatedBy"
      FROM workspaces
      WHERE organization_id = ${auth.organizationID}
      ORDER BY updated_at DESC
    `;

    const workspaces: Workspace[] = [];
    for await (const row of rows) {
      workspaces.push(row);
    }

    return { workspaces };
  },
);

// Create workspace endpoint
export const createWorkspace = api(
  {
    method: 'POST',
    path: '/workspaces',
    auth: true,
  },
  async (req: CreateWorkspaceRequest): Promise<CreateWorkspaceResponse> => {
    const auth = getAuthData() as AuthData;

    if (!req.title) {
      throw APIError.invalidArgument('Title is required');
    }

    // Create preview from content if provided
    const preview = req.content?.length >= 200 ? req.content.substring(0, 200) + '...' : '';

    const row = await DB.queryRow<Workspace>`
      INSERT INTO workspaces (
        organization_id,
        title,
        content,
        preview,
        created_by,
        updated_by
      )
      VALUES (
        ${auth.organizationID},
        ${req.title},
        ${req.content || ''},
        ${preview},
        ${auth.userID},
        ${auth.userID}
      )
      RETURNING
        id,
        title,
        preview,
        updated_at as "updatedAt",
        updated_by as "updatedBy"
    `;

    if (!row) {
      throw APIError.internal('Failed to create workspace');
    }

    return { workspace: row };
  },
);

// Update workspace endpoint
export const updateWorkspace = api(
  {
    method: 'PUT',
    path: '/workspace/:id',
    auth: true,
  },
  async (req: UpdateWorkspaceRequest): Promise<UpdateWorkspaceResponse> => {
    const auth = getAuthData() as AuthData;

    console.log('req');
    console.dir(req);

    // Create preview from content if provided
    const preview = req.content?.length >= 200 ? req.content.substring(0, 200) + '...' : req.content;

    const row = await DB.queryRow<Workspace>`
      UPDATE workspaces
      SET
        title = COALESCE(${req.title}, title),
        content = COALESCE(${req.content}, content),
        preview = COALESCE(${preview}, preview),
        updated_by = ${auth.userID},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${req.id}
      AND organization_id = ${auth.organizationID}
      RETURNING
        id,
        title,
        content,
        preview,
        updated_at as "updatedAt",
        updated_by as "updatedBy"
    `;

    if (!row) {
      throw APIError.notFound('Workspace not found');
    }

    return { workspace: row };
  },
);

// Delete workspace endpoint
export const deleteWorkspace = api(
  {
    method: 'DELETE',
    path: '/workspace/:id',
    auth: true,
  },
  async (params: { id: string }): Promise<DeleteWorkspaceResponse> => {
    const auth = getAuthData() as AuthData;

    const result = await DB.queryRow`
      DELETE FROM workspaces
      WHERE id = ${params.id}
      AND organization_id = ${auth.organizationID}
      RETURNING id
    `;

    if (!result) {
      throw APIError.notFound('Workspace not found');
    }

    return { success: true };
  },
);
