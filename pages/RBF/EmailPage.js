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

  async verifyingCompanyNameOnEmail()
  {
    // Verify Company Name
   const companyLocator = this.page.locator("xpath=//p[text()='OSCAR MAYER (ROWAN FOODS)']");
   const actualCompanyName = await companyLocator.textContent();

  if (actualCompanyName.trim() === "OSCAR MAYER (ROWAN FOODS)") {
    console.log("✅ Company name is correct: OSCAR MAYER (ROWAN FOODS)");
  } else {
    console.error(`❌ Company name mismatch: expected "OSCAR MAYER (ROWAN FOODS)", but got "${actualCompanyName.trim()}"`);
    throw new Error("Company name does not match expected value.");
  }
  }

}

module.exports = Email_Page;