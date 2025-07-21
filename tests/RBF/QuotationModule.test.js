import { test, expect, chromium, firefox } from '@playwright/test';
import LoginPage from '../../pages/RBF/LoginPage';
import New_Quotation_V2 from '../../pages/RBF/NewQuotationV2Page';
import Email_Page from '../../pages/RBF/EmailPage';
 
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
 
    const expectedURL = "https://rbf-cargocare.wavestesting.com/";
    let success = false;
    let maxAttempts = 2;
 
    for (let i = 0; i < maxAttempts; i++) {
      await page.waitForLoadState('networkidle');
      const currentURL = page.url();
      console.log(`🔍 Attempt ${i + 1}: Current URL is ${currentURL}`);
      if (currentURL === expectedURL) {
        success = true;
        break;
      } else {
        console.warn(`⚠️ Unexpected URL (${currentURL}). Navigating back...`);
        await page.goBack();
      }
    }
 
    expect(success).toBeTruthy();
    await expect(page).toHaveURL(expectedURL);
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
 
// ------------------------------
// Login and User Takeover Flow
// ------------------------------
test.describe('🔐 Login and User Takeover Flow', () => {
  test('1. Verify Dashboard is visible after login', async () => {
    await expect(page).toHaveURL('https://rbf-cargocare.wavestesting.com/');
  });
 
  test('2. User takeover', async () => {
    await loginPage.UserTakeOver_Quotation_Module();
    await page.waitForTimeout(3000);
  });
});
 
// ------------------------------
// Quotation V2 Flow
// ------------------------------
test.describe('📋 Quotation V2 Flow', () => {
  test('3. Navigate to Sales and start New Quotation V2', async () => {          
    await quotationPage.navigateToNewQuotationV2();
    await expect(page).toHaveURL("https://rbf-cargocare.wavestesting.com/quotations-v2/add.html");
  });
 
  test('4. Quotation V2 Step 1 - Fill Company and Details', async () => {
    await quotationPage.step1_fillCompanyAndDetails();
    selectedCompany = quotationPage.selectedCompanyName ? quotationPage.selectedCompanyName.trim() : undefined;
    generatedCode = quotationPage.generatedCode; //NOTABLE CHANGES
  });
 
  test('5. Quotation V2 Step 2 - Verify Tariff and Add Lines', async () => {
    await quotationPage.step2_verifyTariffAndAddLines();
  });
 
  test('6. Quotation V2 Step 3 - Verify Tariff and Add Lines', async () => {
    await quotationPage.step3_verifyTariffAndAddLines();  
  });
 
  test('7. Quotation V2 Step 4 - Verify Tariff and Add Lines', async () => {
    await quotationPage.step4_verifyTariffAndAddLines();
  });
 
  test('8. Verify the Quotation on Sendlist', async () => {
    await quotationPage.Verifying_Quotation_on_Sendlist();
  });
 
  test('9. Click and send the Quotation from Sendlist', async () => {
    await quotationPage.check_and_send_quotation();
  });
 
  test('10. Verifying success', async () => {
    await quotationPage.verifySuccessMessage();
  });
});
 
// ------------------------------
// Quotation Email Verification
// ------------------------------
test.describe('📧 Quotation Email Verification', () => {
  test('1. Navigation to operational module', async () => {
    await emailPage.navigateToOperationalModule();
    await expect(page).toHaveURL('https://rbf-cargocare.wavestesting.com');
  });
 
  test('2. Select and Verify email history module', async () => {
    await emailPage.selectEmailHistoryModule();
    await expect(page).toHaveURL('https://rbf-cargocare.wavestesting.com/email-history/overview.html');
  });
 
  test('3. View Quotation email and Verify Email type', async () => {
    await emailPage.ViewQuotationEmail();
  });
 
  test('4. Verify Company name on Quotation email', async () => {
    await emailPage.verifyingCompanyNameOnEmail(selectedCompany);
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