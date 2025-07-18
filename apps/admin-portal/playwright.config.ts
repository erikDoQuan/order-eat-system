import path from 'path';
import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.PORT || 3000;
const baseURL = `http://localhost:${PORT}`;

// Reference: https://playwright.dev/docs/test-configuration
export default defineConfig({
  timeout: 60 * 1000,
  testDir: path.resolve(__dirname, '__tests__/e2e'),
  testMatch: '__tests__/e2e/**/*.e2e.ts',
  retries: 2,
  outputDir: 'e2e-results/',
  workers: process.env.CI ? 4 : undefined,
  reporter: process.env.CI ? 'dot' : 'list',
  webServer: {
    command: process.env.NODE_ENV === 'development' ? 'yarn dev' : 'yarn start',
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL,
    trace: 'retry-with-trace',
  },
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    // { name: 'Desktop Firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'Desktop Safari', use: { ...devices['Desktop Safari'] } },
    // { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    // { name: 'Mobile Safari', use: devices['iPhone 12'] }
  ],
});
