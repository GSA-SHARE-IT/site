/* eslint import/no-extraneous-dependencies: ["error", { "devDependencies": true }] */
const { defineConfig, devices } = require('@playwright/test');

// Not 8080, so it doesn't collide with `npm run dev`
const PORT = 8099;

module.exports = defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Set PLAYWRIGHT_CHANNEL=chrome to use an installed Chrome when the
        // bundled Chromium can't be downloaded (e.g. behind a proxy).
        channel: process.env.PLAYWRIGHT_CHANNEL,
      },
    },
  ],
  // Build once and serve _site as static files. `eleventy --serve` would
  // rebuild and live-reload pages mid-test whenever files change.
  webServer: {
    command: `npm run build && npx @11ty/eleventy-dev-server --dir=_site --port=${PORT}`,
    url: `http://localhost:${PORT}`,
    // Fail on a busy port rather than silently testing some other server
    reuseExistingServer: false,
    timeout: 180 * 1000,
  },
});
