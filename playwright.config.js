// playwright.config.js
const { devices, chromium } = require('@playwright/test');
const { getBaseURL } = require('./helpers/environment');

module.exports = {
  testDir: './tests',
  testMatch: '**/*.test.js',
  timeout: 60000,
  retries: 0,
  reporter: [['list'], ['allure-playwright']],

  projects: [
    // {
    //   name: 'chromium',
    //   use: {
    //     baseURL: getBaseURL(),
    //     browserName: 'chromium',
    //     headless: true,
    //     trace: 'on',
    //     screenshot: 'only-on-failure',
    //     video: 'retain-on-failure',
    //    },
    {
      
  name: 'firefox',
  use: {
    baseURL: getBaseURL(),
    browserName: 'firefox',
    headless: true,
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // name: 'Edge',
  // use: {
  //   baseURL: getBaseURL(),
  //   browserName: 'webkit',
  //   headless: true,
  //   trace: 'on',
  //   screenshot: 'only-on-failure',
  //   video: 'retain-on-failure',
  // },

    },
  ],
};
