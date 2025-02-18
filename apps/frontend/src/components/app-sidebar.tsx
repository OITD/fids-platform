import type * as React from 'react';
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Folder,
} from 'lucide-react';

import { Local } from '~/lib/client';
import { useWorkspaceApi } from '~/api/workspace';
import { NavMain } from './nav-main';
import { NavProjects } from './nav-projects';
import { NavUser } from './nav-user';
import { TeamSwitcher } from './team-switcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '~/components/ui/sidebar';
import { useNavigate, useParams } from 'react-router';
import { useLogto } from '@logto/react';
import { useResourceApi } from '~/api/resource';
import { useEffect, useState } from 'react';
import type { Workspace } from '~/api/workspace';
import { LoadingSpinner } from '~/components/loading-spinner';
import { ErrorMessage } from '~/pages/OrganizationPage/components/ErrorMessage';
import type { OrganizationData, NavItem, Project, UserData } from '~/types/organization';

// Move this to a separate navigation config file
const defaultNavItems: NavItem[] = [
  {
    title: 'Playground',
    url: '/playground',
    icon: SquareTerminal,
    items: [
      {
        title: 'History',
        url: '/playground/history',
      },
      {
        title: 'Starred',
        url: '/playground/starred',
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { orgId: organizationId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, fetchUserInfo } = useLogto();
  const { getUserOrganizationScopes, getOrganizations } = useResourceApi();
  const { getWorkspaces } = useWorkspaceApi();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userScopes, setUserScopes] = useState<string[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  // Load user data and organizations
  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        setLoading(true);
        const [userInfo, orgs] = await Promise.all([fetchUserInfo(), getOrganizations()]);

        if (!userInfo) {
          throw new Error('Failed to fetch user info');
        }

        // Set user data
        setUserData({
          name: userInfo.name || userInfo.username || 'User',
          email: userInfo.email || 'No email',
          avatar: userInfo.picture || '',
        });

        // Set organizations
        setOrganizations(
          orgs.map((org) => ({
            id: org.id,
            name: org.name,
            description: org.description,
            logo: GalleryVerticalEnd,
            plan: 'Free',
          })),
        );
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [isAuthenticated, fetchUserInfo, getOrganizations]);

  // Load organization-specific data when organization changes
  useEffect(() => {
    const loadOrgData = async () => {
      if (!organizationId || !isAuthenticated) {
        return;
      }

      try {
        setLoading(true);
        const [scopes, workspacesData] = await Promise.all([
          getUserOrganizationScopes(organizationId),
          getWorkspaces(organizationId),
        ]);

        setUserScopes(scopes);
        setWorkspaces(workspacesData);
      } catch (error) {
        console.error('Failed to fetch organization data:', error);
        setError('Failed to load organization data');
      } finally {
        setLoading(false);
      }
    };

    loadOrgData();
  }, [organizationId, isAuthenticated, getUserOrganizationScopes, getWorkspaces]);

  const handleOrgClick = (orgId: string) => {
    setWorkspaces([]); // Clear workspaces when switching organizations
    setUserScopes([]); // Clear scopes when switching organizations
    navigate(`/${orgId}`);
  };

  const handleWorkspaceClick = (workspaceId: string) => {
    if (organizationId) {
      navigate(`/${organizationId}/space/${workspaceId}`);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  // Convert workspaces to project format for NavProjects
  const workspaceProjects: Project[] = workspaces.map((workspace) => ({
    name: workspace.title,
    url: `/${organizationId}/space/${workspace.id}`,
    icon: Folder,
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={organizations.map((org) => ({
            id: org.id,
            name: org.name,
            logo: org?.logo || GalleryVerticalEnd,
            plan: org.plan,
          }))}
          onTeamSelect={handleOrgClick}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={defaultNavItems} />
        {organizationId && <NavProjects projects={workspaceProjects} />}
      </SidebarContent>
      <SidebarFooter>
        {userData && (
          <NavUser
            user={{
              name: userData.name,
              email: userData.email,
              avatar: userData.avatar || '',
            }}
          />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
