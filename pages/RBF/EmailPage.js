const BasePage = require('../../helpers/BasePage');
const { expect } = require('@playwright/test');
 
class Email_Page extends BasePage {
  constructor(page) {
    super(page);
    this.generatedCode = ''; // class-level property
  }
 
 
  async navigateToOperationalModule() {
 
    console.log("➡️ Navigating to Operational Module...");
    await this.page.waitForSelector("xpath=//a[@title='Operational']", { state: 'visible', timeout: 10000 });
    await this.page.locator("xpath=//a[@title='Operational']").click();
 
     console.log("➡️ Verifying Operationl URL")
 
    await this.page.waitForTimeout(500);
 
  }
 
  async selectEmailHistoryModule() {
 
    console.log("➡️ Expanding Email History menu...");
 
    const emailHistoryLink = this.page.locator("xpath=//h2[@class='noslide mailhistory ']//a[@title='E-mail History']");
    await emailHistoryLink.scrollIntoViewIfNeeded();
    await emailHistoryLink.waitFor({ state: 'visible', timeout: 10000 });
    await emailHistoryLink.click();
 
    console.log("➡️ Verifying Email History URL")
 
    await this.page.waitForTimeout(500);
  }
 
  async ViewQuotationEmail(){
 
    //View email
 
    console.log("➡️ Clicking on View email button for quotation...");
   
    await this.page.waitForSelector("(//div[@class='subject' and contains(text(), 'Your requested Quotation')]//following-sibling::div//a[@title='View E-mail'])[1]", { state: 'visible', timeout: 10000 });
    await this.page.locator("(//div[@class='subject' and contains(text(), 'Your requested Quotation')]//following-sibling::div//a[@title='View E-mail'])[1]").click();
 
   console.log("🔄 You are in view quotation email module...");
 
   //Verify email type
   const emailTypeLocator = this.page.locator("xpath=//p[text()='Quotation']");
   const emailType = (await emailTypeLocator.textContent()).trim();
 
    if (emailType === "Quotation") {
      console.log("✅ Email type is Quotation");
    } else {
      console.error(`❌ Email type mismatch. Found: ${emailType}`);
      throw new Error("Email type mismatch.");
    }
      }
      
  async verifyingCompanyNameOnEmail(expectedCompanyName) {
  // Remove trailing numbers OR code in parentheses + whitespace
  const cleanCompanyName = expectedCompanyName
    .replace(/\(.*?\)/g, '')  // remove text in parentheses like (OSC101)
    .replace(/\d+$/, '')      // remove any trailing digits
    .trim();

  console.log(`[DEBUG] Checking for company name: ${cleanCompanyName}`);

  const companyLocator = this.page.locator('xpath=//*[@id="content"]/div[2]/div/div[1]/div[3]/div[1]/p');
  await companyLocator.waitFor({ state: 'visible', timeout: 10000 }).catch(async () => {
    const html = await this.page.content();
    console.error('[DEBUG] Company name not found. Page content:', html);
    throw new Error(`Company name "${cleanCompanyName}" not found in email view.`);
  });

  const actualCompanyName = await companyLocator.textContent();
  if (actualCompanyName && actualCompanyName.trim().includes(cleanCompanyName)) {
    console.log(`✅ Company name is correct: ${cleanCompanyName}`);
  } else {
    console.error(`❌ Company name mismatch: expected "${cleanCompanyName}", but got "${actualCompanyName ? actualCompanyName.trim() : 'null'}"`);
    throw new Error("Company name does not match expected value.");
  }
}

 
  async navigateToSentQuotation(){
 
  console.log("📝 Checking sent quotation overview...");
  const returnBtn = this.page.locator("//a[@title='Return to overview']");
  await returnBtn.waitFor({ state: 'visible', timeout: 10000 });
  await returnBtn.click();
 
  console.log("📝 Clicking the Sales Module...");
  await this.page.waitForSelector("xpath=//a[text()='Sales']", { state: 'visible', timeout: 10000 });
    await this.page.locator("xpath=//a[text()='Sales']").click();
 
    console.log("➡️ Expanding Quotations menu...");
    await this.page.waitForSelector("xpath=//h2[@class='slide quotations ']//a[text()='Quotations']", { state: 'visible', timeout: 10000 });
    await this.page.locator("xpath=//h2[@class='slide quotations ']//a[text()='Quotations']").click();
 
    console.log("➡️ Clicking Sent Quotation...");
    await this.page.locator("xpath=//li//a[text()='Sent Quotations']").click();
 
    console.log("🔄 Waiting for quotation page URL...");
    await this.page.waitForURL("https://rbf-cargocare.wavestesting.com/quotations-v2/overviews/sent.html", { timeout: 20000 });
 
    console.log("✅ You have successfully navigated to the Sent Quotations overview");
 
 
}
 
}
 
module.exports = Email_Page;