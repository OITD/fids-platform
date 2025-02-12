import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import { expand } from 'dotenv-expand';
import { config } from 'dotenv';
import path from 'path';

// Custom function to load and expand env files
function loadAndExpandEnv(mode: string) {
  // Load root .env first
  const rootEnv = config({
    path: path.resolve(__dirname, '../../.env'),
  });
  expand(rootEnv);

  // Load environment-specific .env files
  const localEnv = config({
    path: path.resolve(__dirname, `.env.${mode}`),
  });
  expand(localEnv);

  // Load local .env last (for overrides)
  const specificEnv = config({
    path: path.resolve(__dirname, '.env'),
  });
  expand(specificEnv);

  // Return the processed env variables
  return {
    ...rootEnv.parsed,
    ...localEnv.parsed,
    ...specificEnv.parsed,
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load and expand env files
  const env = loadAndExpandEnv(mode);

  return {
    plugins: [react(), tsconfigPaths()],
    define: {
      // Expose env variables to the client app
      // Note: Must prefix with VITE_ to be exposed
      ...Object.keys(env || {}).reduce<Record<string, string>>((acc, key) => {
        if (key.startsWith('VITE_')) {
          acc[`process.env.${key}`] = JSON.stringify(env?.[key]);
        }
        return acc;
      }, {}),
    },
    server: {
      port: Number(process.env.PORT),
      hmr: {
        port: Number(process.env.VITE_HMR_PORT),
      },
      allowedHosts: [`.${process.env.DOMAIN}`, 'localhost:4000'],
      strictPort: true,
    },
  };
});
