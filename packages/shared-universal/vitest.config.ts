import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, ViteUserConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()] as ViteUserConfig['plugins'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './__tests__'),
      '@mocks': path.resolve(__dirname, './__mocks__'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./__tests__/unit/setup/index.ts'],
    include: ['./src/**/*.{test,spec}.{ts,tsx}', './__tests__/unit/**/*.{test,spec}.{ts,tsx}'],
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
