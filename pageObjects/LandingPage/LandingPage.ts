import { expect, Page } from "@playwright/test";
import { CommonPage } from "../../base_fwk/common/CommonPage";
import { CommonScenario } from "../../base_fwk/common/CommonScenario";
import { locators } from "./LandingPageLocators";
export class LandingPage extends CommonPage {
    constructor(public page: Page, readonly scenario: CommonScenario) {
        super(page, scenario);
    }

    async verifyProductIsDisplayed(productName: string) {
        //await this.page.waitForTimeout(2000);
        const selectedProductElement = await this.page.getByRole('heading', { name: productName });
        await selectedProductElement.waitFor({ state: "visible" });
        expect(selectedProductElement.isVisible).toBeTruthy();
    };

    async clickCheckout() {
        await this.page.getByRole('button', { name: 'Checkout❯' }).click();
        await this.takeScreenshot("checkout");
    };

    async verifyLinks() {
        const links = await this.page.$$('a');
        for(const link of links) {
            const href = await link.getAttribute('href');
            if(!href || href.startsWith('#')) {
                // Skip invalid or anchor links
                continue;                
            }
            // Adjust timeout as needed
            const response = await this.page.goto(href, { timeout: 5000 }); 
            expect(response && response.status() >=400).toBeFalsy();
        }
    };
}