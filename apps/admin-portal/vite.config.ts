import * as path from 'path';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv, UserConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }: UserConfig) => {
  // Load environment variables based on mode
  const envDir = path.join(__dirname, './envs');
  // Use .env.base as default and override with mode-specific vars
  const baseEnv = loadEnv('base', envDir, '');
  const modeEnv = loadEnv(mode, envDir, '');

  // Merge base and mode-specific environments, with mode-specific taking precedence
  const env = { ...baseEnv, ...modeEnv };

  console.log(`Building for mode: ${mode}`);
  console.log('VITE_API_BASE_URL', env.VITE_API_BASE_URL);

  return {
    base: '/',
    envDir,
    mode: mode === 'development' ? 'development' : 'production',
    plugins: [
      // Only use tsconfig paths for local paths
      tsconfigPaths({
        loose: true,
      }),
      react(),
      visualizer(),
    ],
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      // Increase build performance
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@loyalty-system/react-web-ui-shadcn'],
            sharedWeb: ['@loyalty-system/shared-web'],
            sharedUniversal: ['@loyalty-system/shared-universal'],
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3001,
      open: false,
      cors: true,
      proxy: {
        '^/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '/api'),
          secure: mode !== 'development',
          xfwd: true,
          headers: {
            'X-Forwarded-Proto': 'http',
            'X-Forwarded-Host': 'localhost',
          },
          timeout: 1000 * 60 * 1,
          proxyTimeout: 1000 * 60 * 1,
        },
      },
    },
  };
});
