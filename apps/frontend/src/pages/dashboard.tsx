import { useEffect, useState } from 'react';
import { AppSidebar } from '~/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
import { Separator } from '~/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar';

import viteLogo from '/vite.svg';
import reactLogo from '~/assets/react.svg';
import Client, { Local } from '~/lib/client.ts';
import { isBlank } from '@fids-platform/common';

export default function Dashboard() {
  const [count, setCount] = useState(0);
  const [greeting, setGreeting] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Create a new client instance using the Local endpoint
    const client = new Client(Local);

    // Make the API call when component mounts
    const fetchGreeting = async () => {
      try {
        const response = await client.hello.get('Frontend User');
        setGreeting(response.message);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch greeting');
      }
    };

    fetchGreeting();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
            <div>
              <a href="https://vite.dev" target="_blank">
                <img src={viteLogo} className="logo" alt="Vite logo" />
              </a>
              <a href="https://react.dev" target="_blank">
                <img src={reactLogo} className="logo react" alt="React logo" />
              </a>
            </div>
            <h1>Vite + React</h1>

            {/* Display the greeting from the API */}
            {greeting && (
              <div className="greeting">
                <h2>{greeting}</h2>
              </div>
            )}

            {/* Display any errors */}
            {error && (
              <div className="error" style={{ color: 'red' }}>
                Error: {error}
              </div>
            )}

            <div className="card">
              <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
              <p>
                Edit <code>src/App.tsx</code> and save to test HMR
              </p>
            </div>
            <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
            <div>
              <p>undefined isBlank - {isBlank(undefined) ? 'true' : 'false'}</p>
              <p>false isBlank - {isBlank(false) ? 'true' : 'false'}</p>
              <p>true isBlank - {isBlank(true) ? 'true' : 'false'}</p>
              <p>Empty object isBlank - {isBlank({}) ? 'true' : 'false'}</p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
