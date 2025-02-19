export interface Workspace {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  updatedBy: string;
  content: string;
}

export interface CreateWorkspaceRequest {
  title: string;
  content: string;
}

export interface CreateWorkspaceResponse {
  workspace: Workspace;
}

export interface GetWorkspaceRequest {
  id: string;
}

export interface GetWorkspaceResponse {
  workspace: Workspace;
}

// Auth data structure matching the Express implementation
export interface AuthData {
  userID: string;
  organizationID: string;
}

export interface UpdateWorkspaceRequest {
  id: string;
  title: string;
  content: string;
}

export interface UpdateWorkspaceResponse {
  workspace: Workspace;
}

export interface DeleteWorkspaceResponse {
  success: boolean;
}
