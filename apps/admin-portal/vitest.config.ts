import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@tests': fileURLToPath(new URL('./__tests__', import.meta.url)),
      '@mocks': fileURLToPath(new URL('./__mocks__', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./__tests__/unit/setup/index.ts'],
    include: ['./src/**/*.{test,spec}.{ts,tsx}', './__tests__/unit/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    coverage: {
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/libs'],
      provider: 'v8', // 'v8', 'istanbul'
      reportsDirectory: './coverage-unit',
      extension: ['.ts', '.tsx', '.js', '.jsx'],
      reporter: ['text', 'json', 'html'],
    },
  },
});
