import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const rootDir = resolve(__dirname, '..');
  const env = loadEnv(mode, rootDir, '');

  const allowedHosts: string[] = [];
  if (env.APP_BASE_URL) {
    try {
      allowedHosts.push(new URL(env.APP_BASE_URL).hostname);
    } catch {
      // Ignore malformed APP_BASE_URL values and let Vite use its defaults.
    }
  }

  return {
    root: resolve(__dirname),
    envDir: rootDir,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: {
      emptyOutDir: true,
      outDir: resolve(__dirname, '../dist/client'),
    },
    server: {
      allowedHosts,
    },
  };
});
