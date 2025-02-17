import { api } from 'encore.dev/api';
// import log from "encore.dev/log";
import { getAuthData } from '~encore/auth';
import { APIError } from 'encore.dev/api';

interface DashboardData {
  value: string;
}

// Endpoint that responds with a hardcoded value.
// To call it, run in your terminal:
//
//	curl --header "Authorization: <valid-token>" http://localhost:4000/admin
//
export const getDashboardData = api(
  {
    expose: true, // Is publicly accessible
    auth: true, // Auth handler validation is required
    method: 'GET',
    path: '/admin',
  },
  async (): Promise<DashboardData> => {
    const auth = getAuthData();

    console.log(auth);

    // Check if user has admin role
    // if (auth && !auth.scopes?.includes('admin')) {
    //   throw APIError.permissionDenied('Admin access required');
    // }

    // Some admin logic here
    return { value: JSON.stringify(auth, null, 2) };
  },
);

// POST protected admin endpoint
export const adminAction = api(
  {
    method: 'POST',
    auth: true,
  },
  async () => {
    const auth = getAuthData();

    // Check if user has admin role
    // if (auth && !auth.roles?.includes('admin')) {
    //   throw APIError.permissionDenied('Admin access required');
    // }

    // Some admin logic here
    return { success: true };
  },
);
