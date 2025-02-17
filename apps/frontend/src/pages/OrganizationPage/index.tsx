import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useLogto } from '@logto/react';
import { useResourceApi, type Organization } from '~/api/resource';
import { useWorkspaceApi, type Workspace } from '~/api/workspace';
import { ActionBar } from './components/ActionBar';
import { WorkspaceList } from './components/WorkspaceList';
import { CreateWorkspaceDialog } from './components/CreateWorkspaceDialog';
import { EditWorkspaceDialog } from './components/EditWorkspaceDialog';
import { LoadingSpinner } from '../../components/loading-spinner.tsx';
import { ErrorMessage } from './components/ErrorMessage';
import { WorkspaceTopbar } from '~/components/workspace-topbar';
import { Button } from '~/components/ui/button';
import { Plus } from 'lucide-react';

export const OrganizationPage = () => {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useLogto();
  const { getUserOrganizationScopes } = useResourceApi();
  const { getWorkspaces, updateWorkspace, deleteWorkspace } = useWorkspaceApi();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editWorkspaceId, setEditWorkspaceId] = useState<Workspace['id']>();
  const [userScopes, setUserScopes] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!orgId || !isAuthenticated) return;

      setLoading(true);
      setError(null);

      try {
        const [scopes, workspacesData] = await Promise.all([getUserOrganizationScopes(orgId), getWorkspaces(orgId)]);

        setUserScopes(scopes);
        setWorkspaces(workspacesData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [orgId, isAuthenticated, getWorkspaces, getUserOrganizationScopes]);

  const handleWorkspaceClick = (workspaceId: string) => {
    navigate(`/${orgId}/space/${workspaceId}`);
  };

  const handleWorkspaceEdit = (workspaceId: string) => {
    setEditWorkspaceId(workspaceId);
    setIsEditDialogOpen(true);
  };

  const handleWorkspaceDelete = (workspaceId: string) => {
    deleteWorkspace(orgId, workspaceId);
  };

  const renderActions = () => {
    if (!userScopes.includes('create:resources')) return null;
    
    return (
      <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
        <Plus className="mr-2 h-4 w-4" />
        New Workspace
      </Button>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="flex h-full flex-col">
      <WorkspaceTopbar title="Workspaces" actions={renderActions()} />
      
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <WorkspaceList
            workspaces={workspaces}
            onWorkspaceClick={handleWorkspaceClick}
            canEdit={userScopes?.includes('edit:resources')}
            onWorkspaceEdit={handleWorkspaceEdit}
            canDelete={userScopes?.includes('delete:resources')}
            onWorkspaceDelete={handleWorkspaceDelete}
          />
        </div>
      </div>

      {isCreateDialogOpen && (
        <CreateWorkspaceDialog
          onClose={() => setIsCreateDialogOpen(false)}
          onWorkspaceCreated={(workspace) => {
            setWorkspaces((prev) => [workspace, ...prev]);
            setIsCreateDialogOpen(false);
          }}
        />
      )}

      {isEditDialogOpen && editWorkspaceId && workspaces.some((w) => w.id === editWorkspaceId) && (
        <EditWorkspaceDialog
          workspace={workspaces.find((workspace) => workspace.id === editWorkspaceId)!} // Ensures workspace is never undefined
          onClose={() => {
            console.log('onClose');
            setEditWorkspaceId(undefined);
            setIsEditDialogOpen(false);
          }}
          onWorkspaceUpdated={(updatedWorkspace) => {
            console.log('index onWorkspaceUpdated workspace', updatedWorkspace);
            setWorkspaces((prev) => prev.map((w) => (w.id === updatedWorkspace.id ? updatedWorkspace : w)));
            setEditWorkspaceId(undefined);
            setIsEditDialogOpen(false);
          }}
        />
      )}
    </div>
  );
};
