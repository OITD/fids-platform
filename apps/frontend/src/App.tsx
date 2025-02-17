import { LogtoProvider, LogtoConfig, useLogto, UserScope, ReservedResource } from '@logto/react';
import { Routes, Route } from 'react-router';

import { PageLayout } from '~/layouts/page-layout';

import { Landing } from '~/pages/Landing';
import { Dashboard } from '~/pages/Dashboard';
import { Callback } from '~/pages/Callback';
import { AdminDashboard } from '~/pages/AdminDashboard';
import { OrganizationPage } from '~/pages/OrganizationPage';

import { APP_ENV } from '~/env';
import { WorkspacePage } from '~/pages/WorkspacePage';
import RequireAuth from '~/lib/require-auth';
import { AdminLayout } from '~/layouts/admin-layout';
import { useEffect, useState } from 'react';

console.log('APP_ENV:', JSON.stringify(APP_ENV, null, 4));

const config: LogtoConfig = {
  endpoint: APP_ENV.logto.url,
  appId: APP_ENV.logto.appId,
  scopes: [
    UserScope.Organizations,
    'create:organization',
    'create:resources',
    'read:resources',
    'edit:resources',
    'delete:resources',
  ],
  resources: [ReservedResource.Organization, APP_ENV.api.resourceIndicator],
};

export default function App() {
  return (
    <LogtoProvider config={config}>
      <Routes>
        <Route path="/callback" element={<Callback />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </LogtoProvider>
  );
}

function AppContent() {
  const { isAuthenticated, getOrganizationToken, getOrganizationTokenClaims, getIdTokenClaims } = useLogto();
  const [organizationIds, setOrganizationIds] = useState<string[]>();

  useEffect(() => {
    (async () => {
      const claims = await getIdTokenClaims();

      console.log('ID token claims', claims);
      setOrganizationIds(claims?.organizations);
    })();
  }, [getIdTokenClaims]);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route element={<PageLayout />}>
          <Route path="/" element={<Landing />} />
        </Route>
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<RequireAuth />}>
        <Route element={<PageLayout />}>
          <Route path="/" element={<Dashboard />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/:orgId" element={<OrganizationPage />} />
          <Route path="/:orgId/space/:workspaceId" element={<WorkspacePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}
