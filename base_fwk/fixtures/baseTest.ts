import { LoginPage } from "../../pageObjects/LoginPage/LoginPage"
import { DashboardPage } from '../../pageObjects/DashBoardPage/DashBoardPage';
import { OrdersHistoryPage } from '../../pageObjects/OrdersHistoryPage/OrdersHistoryPage';
import { OrdersReviewPage } from '../../pageObjects/OrdersReviewPage/OrdersReviewPage';
import { LandingPage } from '../../pageObjects/LandingPage/LandingPage';
import { Page, test as baseTest } from "@playwright/test";
import { CommonScenario } from "../common/CommonScenario";
import { CommonPage } from "../common/CommonPage";

// declaring the objects type for autocompletion 
interface PageObjects {
    loginPage: LoginPage;
    dashboardPage: DashboardPage;
    ordersHistoryPage: OrdersHistoryPage;
    ordersReviewPage: OrdersReviewPage;
    landingPage: LandingPage;
    commonScenarioPage: CommonScenario;
    commonPage: CommonPage,
}
// intializing all the page objects you have in your app
// and import them as fixture in spec file
const test = baseTest.extend<PageObjects>({
    commonScenarioPage: async ({ page }, use, testinfo) => {
        await use(new CommonScenario(page, testinfo));
    },
    loginPage: async ({ page, commonScenarioPage }, use) => {
        await use(new LoginPage(page, commonScenarioPage));
    },
    dashboardPage: async ({ page, commonScenarioPage }, use) => {
        await use(new DashboardPage(page, commonScenarioPage));
    },
    ordersHistoryPage: async ({ page, commonScenarioPage }, use) => {
        await use(new OrdersHistoryPage(page, commonScenarioPage));
    },
    ordersReviewPage: async ({ page, commonScenarioPage }, use) => {
        await use(new OrdersReviewPage(page, commonScenarioPage));
    },
    landingPage: async ({ page, commonScenarioPage }, use) => {
        await use(new LandingPage(page, commonScenarioPage));
    },
    // allPages: async ({ page, commonScenarioPage }, use) => {
    //     await use({
    //         loginPage: new LoginPage(page, commonScenarioPage),
    //         dashboardPage: new DashboardPage(page, commonScenarioPage)

    //     } as PageObjects);
    // }
    /* ,
        commonPage: async ({ page }, use) => {
            await use(new CommonPage(page));
        } */

});
// this describe block is applicable to all the tests using baseTest
// test.describe('two tests', () => {
//     console.log("in describe");

// });
// hooks as fixtures
// let authenticatedPage: Page;
test.beforeEach(async ({ browser }) => {
   // console.log('beforeEach tests');
});

test.afterEach(async ({ }) => {
   // console.log('afterEach tests');
});

// export default and name export so spec files can use it 
export default test;
export const expect = test.expect;
