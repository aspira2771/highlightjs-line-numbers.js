import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { characterProxy } from './vite.character-proxy';

export default defineConfig(({ mode }) => {
  // Load all env vars (incl. non-VITE_ ones) for server-side use only.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), characterProxy(env.OPENAI_API_KEY)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  };
});
