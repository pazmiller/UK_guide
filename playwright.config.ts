import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const host = process.env.PLAYWRIGHT_HOST ?? '127.0.0.1';
const baseURL = `http://${host}:${port}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  retries: process.env.CI ? 2 : 0,
  reporter: [
    [ 'list' ],
    [ 'html', { open: 'never' } ],
  ],
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: {
    command: `npm run dev -- --hostname ${host} --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
