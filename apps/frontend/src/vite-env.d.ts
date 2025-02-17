/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_LOGTO_URL: string;
  readonly VITE_LOGTO_APP_ID: string;
  readonly VITE_LOGTO_APP_API_RESOURCE: string;
  readonly VITE_APP_URL: string;
  readonly VITE_APP_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
