console.log('import.meta.env', JSON.stringify(import.meta.env, null, 2));

export const APP_ENV = {
  logto: {
    url: import.meta.env.VITE_LOGTO_URL,
    appId: import.meta.env.VITE_LOGTO_APP_ID,
  },
  api: {
    baseUrl: import.meta.env.VITE_APP_API_URL,
    resourceIndicator: import.meta.env.VITE_LOGTO_APP_API_RESOURCE,
  },
  app: {
    name: import.meta.env.VITE_APP_NAME,
    description: import.meta.env.VITE_APP_DESCRIPTION,
    redirectUrl: import.meta.env.VITE_APP_URL + '/callback',
    signOutRedirectUri: import.meta.env.VITE_APP_URL,
  },
} as const;
