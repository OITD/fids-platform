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
} from 'lucide-react';

import { Local } from '~/lib/client';

import { NavMain } from './nav-main';
import { NavProjects } from './nav-projects';
import { NavUser } from './nav-user';
import { TeamSwitcher } from './team-switcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '~/components/ui/sidebar';
import { useNavigate, useParams } from 'react-router';
import { useLogto } from '@logto/react';
import { useResourceApi } from '~/api/resource.ts';
import { useEffect, useState } from 'react';
import type { Workspace } from '~/api/workspace.ts';
import { LoadingSpinner } from '~/components/loading-spinner.tsx';
import { ErrorMessage } from '~/pages/OrganizationPage/components/ErrorMessage.tsx';
import type { OrganizationData, NavItem, Project, UserData } from '~/types/organization';
import { useAuth } from '~/hooks/useAuth';

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
  // ... keep other nav items but update URLs to be real routes ...
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { orgId: organizationId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, fetchUserInfo } = useLogto();
  const { getUserOrganizationScopes } = useResourceApi();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userScopes, setUserScopes] = useState<string[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  // Load user data and organizations
  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        setLoading(true);
        const userInfo = await fetchUserInfo();
        
        // Set user data
        setUserData({
          name: userInfo.name || userInfo.username,
          email: userInfo.email,
          avatar: userInfo.picture,
        });

        // Set organizations
        const organizationData = (userInfo?.organization_data || []) as OrganizationData[];
        setOrganizations(organizationData);

        // Load user scopes if we have an organization selected
        if (organizationId) {
          const scopes = await getUserOrganizationScopes(organizationId);
          setUserScopes(scopes);
        }

        // TODO: Load projects from your API
        // const projectsData = await api.getProjects(organizationId);
        // setProjects(projectsData);

      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [isAuthenticated, fetchUserInfo, organizationId, getUserOrganizationScopes]);

  const handleOrgClick = (orgId: string) => {
    navigate(`/${orgId}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher 
          teams={organizations.map(org => ({
            id: org.id,
            name: org.name,
            logo: org.logo || GalleryVerticalEnd,
            plan: org.plan
          }))}
          onTeamSelect={handleOrgClick}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={defaultNavItems} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        {userData && <NavUser user={userData} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
