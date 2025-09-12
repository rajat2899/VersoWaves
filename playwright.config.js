// playwright.config.js
const { devices, chromium } = require('@playwright/test');
const { getBaseURL } = require('./helpers/environment');

module.exports = {
  testDir: './tests',
  testMatch: '**/*.test.js',
  timeout: 90000,
  retries: 0,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['allure-playwright']],

  projects: [
    {
      name: 'chromium',
      use: {
        baseURL: getBaseURL(),
        browserName: 'chromium',
        headless: false,
        trace: 'on',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
    },
    // {
    //   name: 'firefox',
    //   use: {
    //     baseURL: getBaseURL(),
    //     browserName: 'firefox',
    //     headless: false,
    //     trace: 'on',
    //     screenshot: 'only-on-failure',
    //     video: 'retain-on-failure',
    //   },
    // },
  ],
};
