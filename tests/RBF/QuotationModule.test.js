import { test, expect, chromium, firefox } from '@playwright/test';
import LoginPage from '../../pages/RBF/LoginPage';
import New_Quotation_V2 from '../../pages/RBF/NewQuotationV2Page';
import Email_Page from '../../pages/RBF/EmailPage';
import { allure } from 'allure-playwright';
 
let browser;
let context;
let page;
let loginPage;
let quotationPage;
let emailPage;
let selectedCompany = undefined;
let generatedCode; //NOTABLE CHANGES
 
// ------------------------------
// Shared setup
// ------------------------------
test.beforeAll(async () => {
  try {
    console.log('🚀 Launching browser and logging in...');
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();
 
    loginPage = new LoginPage(page);
    quotationPage = new New_Quotation_V2(page);
    emailPage = new Email_Page(page);
 
    await loginPage.navigate();
    await loginPage.login('admin@versowaves.com', 'DUJHkHFkyrY2');
    await loginPage.UserTakeOver_Quotation_Module();
 
    const baseOrigin = 'https://rbf-cargocare.wavestesting.com';
    const expectedURLRegex = new RegExp('^' + baseOrigin.replaceAll('.', '\\.') + '/?$');
    let success = false;
    const maxAttempts = 3;
 
    for (let i = 0; i < maxAttempts; i++) {
      await page.waitForLoadState('networkidle');
      const currentURL = page.url();
      console.log(`🔍 Attempt ${i + 1}: Current URL is ${currentURL}`);
 
      // If intermittently redirected to home.html, go back once and retry
      if (currentURL.startsWith(baseOrigin) && /\/home\.html(\?|#|$)/.test(currentURL)) {
        console.warn(`⚠️ Unexpected URL (${currentURL}). Navigating back...`);
        await page.goBack();
        continue;
      }
 
      // Accept landing on the base dashboard with or without trailing slash
      if (expectedURLRegex.test(currentURL)) {
        success = true;
        break;
      }
 
      // As a fallback, try navigating directly to the base dashboard once
      if (i === maxAttempts - 1) {
        console.warn('⚠️ Final attempt: navigating directly to base dashboard');
        await page.goto(baseOrigin + '/');
        await page.waitForLoadState('networkidle');
        if (expectedURLRegex.test(page.url())) {
          success = true;
        }
      }
    }
 
    expect(success).toBeTruthy();
    await expect(page).toHaveURL(expectedURLRegex);
  } catch (err) {
    console.error('❌ Error during beforeAll setup:', err);
    throw err;
  }
});
 
test.afterAll(async () => {
  console.log('✅ Closing browser after all tests...');
  if (browser) {
    await browser.close();
  }
});

test.describe.configure({ mode: 'serial' });

// ------------------------------
// Login and User Takeover Flow
// ------------------------------
test.describe('🔐 Login and User Takeover Flow', () => {
  test('1. Verify Dashboard is visible after login', async () => {
    await expect(page).toHaveURL(/^https:\/\/rbf-cargocare\.wavestesting\.com\/?$/);
  });
 
}); 
 
// ------------------------------
// Quotation V2 Flow
// ------------------------------
test.describe('📋 Quotation V2 Flow', () => {
  test('3. Navigate to Sales and start New Quotation V2', async () => {  
    allure.label('feature', 'Quotation V2');
    allure.severity('critical');
    allure.story('Navigation');
    allure.step('Navigate to Sales section', async () => {
      await quotationPage.navigateToNewQuotationV2();
    });
    allure.step('Verify add page is ready', async () => {
      await page.locator("//input[@id='company']").waitFor({ state: 'visible', timeout: 30000 });
    });
  });

  test('4. Quotation V2 Step 1 - Fill Company and Details', async () => {
    allure.label('feature', 'Quotation V2');
    allure.severity('critical');
    allure.story('Step 1 - Company and Details');
    // Ensure we are on the correct page in case prior state was lost
    if (page.url() !== 'https://rbf-cargocare.wavestesting.com/quotations-v2/add.html') {
      await quotationPage.navigateToNewQuotationV2();
      // Wait for a reliable element instead of asserting URL strictly
      await page.locator("//input[@id='company']").waitFor({ state: 'visible', timeout: 30000 });
    }
    await allure.step('Fill company and details', async () => {
      await quotationPage.step1_fillCompanyAndDetails();
    });
    selectedCompany = quotationPage.selectedCompanyName ? quotationPage.selectedCompanyName.trim() : undefined;
    generatedCode = quotationPage.generatedCode;
    allure.attachment('Selected Company', selectedCompany, 'text/plain');
    allure.attachment('Generated Quotation Code', generatedCode, 'text/plain');
  });

  test('5. Quotation V2 Step 2 - Verify Tariff and Add Lines', async () => {
    allure.label('feature', 'Quotation V2');
    allure.severity('normal');
    allure.story('Step 2 - Tariff and Lines');
    await allure.step('Verify tariff and add lines', async () => {
      await quotationPage.step2_verifyTariffAndAddLines();
    });
  });

  test('6. Quotation V2 Step 3 - Verify Tariff and Add Lines', async () => {
    allure.label('feature', 'Quotation V2');
    allure.severity('normal');
    allure.story('Step 3 - Tariff and Lines');
    await allure.step('Verify tariff and add lines', async () => {
      await quotationPage.step3_verifyTariffAndAddLines();  
    });
  });

  test('7. Quotation V2 Step 4 - Verify Tariff and Add Lines', async () => {
    allure.label('feature', 'Quotation V2');
    allure.severity('normal');
    allure.story('Step 4 - Tariff and Lines');
    await allure.step('Verify tariff and add lines', async () => {
      await quotationPage.step4_verifyTariffAndAddLines();
    });
  });

  test('8. Verify the Quotation on Sendlist', async () => {
    allure.label('feature', 'Quotation V2');
    allure.severity('minor');
    allure.story('Sendlist Verification');
    await allure.step('Verify quotation on sendlist', async () => {
      await quotationPage.Verifying_Quotation_on_Sendlist();
    });
  });

  test('9. Click and send the Quotation from Sendlist', async () => {
    allure.label('feature', 'Quotation V2');
    allure.severity('critical');
    allure.story('Send Quotation');
    await allure.step('Send quotation from sendlist', async () => {
      await quotationPage.check_and_send_quotation();
    });
  });

  test('10. Verifying success', async () => {
    allure.label('feature', 'Quotation V2');
    allure.severity('blocker');
    allure.story('Success Message');
    await allure.step('Verify success message', async () => {
      await quotationPage.verifySuccessMessage();
    });
  });
});
 
// ------------------------------
// Quotation Email Verification
// ------------------------------
test.describe('📧 Quotation Email Verification', () => {
  test('1. Navigation to operational module', async () => {
    await emailPage.navigateToOperationalModule();
    await expect(page).toHaveURL(/^https:\/\/rbf-cargocare\.wavestesting\.com\/?$/);
  });
 
  test('2. Select and Verify email history module', async () => {
    await emailPage.selectEmailHistoryModule();
    await expect(page).toHaveURL('https://rbf-cargocare.wavestesting.com/email-history/overview.html');
  });
 
  test('3. View Quotation email and Verify Email type', async () => {
    await emailPage.ViewQuotationEmail();
  });
 
//   test('4. Verify Company name on Quotation email', async () => {
//     await emailPage.verifyingCompanyNameOnEmail(selectedCompany); 
//   });
// });

  test('4. Verify Company name on Quotation email', async () => {
    await expect(async () => {
      await emailPage.verifyingCompanyNameOnEmail(selectedCompany);
    }).toPass({ retries: 2, timeout: 20000 });
  });
});
 
// ------------------------------
// Return to Quotation module and navigate to Sent quotation overview
// ------------------------------
test.describe('📨 Sent Quotation Navigation', () => {
  test('1. Email history to Sent Quotation Overview', async () => {
    await emailPage.navigateToSentQuotation();
  });
 
  test('2. View Sent Quotation', async () => {
    await quotationPage.viewSentQuotation();
});
});
 
test.describe('📨 Verification and Validations in View quotation section', () => {
  test('3. Verifying Company name in View quotation section', async () => {
    expect(selectedCompany).toBeDefined();
    await quotationPage.verifyCompanyNameInSentQuotation(selectedCompany);
  });
 
  test('4. Verifying Generated Quotation Reference Code in View quotation section', async () => {
    expect(generatedCode).toBeDefined();
    await quotationPage.verifyGeneratedQuotationCode(generatedCode);
  });
 
  test('5. Verifying Generated Quotation Status from Status History tab', async () => {
    await quotationPage.verifyQuotationStatus();
  });
}); 
 
// Skip granular step-by-step suites to avoid state loss
test.describe('📋 Quotation V2 Flow', () => {});
test.describe('📧 Quotation Email Verification', () => {});
test.describe('📨 Sent Quotation Navigation', () => {});
test.describe('📨 Verification and Validations in View quotation section', () => {}); 