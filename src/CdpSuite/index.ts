import {Lease, LeaseBusinessUnit} from "../WFS";
import {Page} from "../Pages/Page";
import {LoginPage} from "../Pages/LoginPage";
import {RootPage, RootRoute} from "../Pages/RootPage";
import {createLeaseManager, LeaseManagerOptions} from "./LeaseManager";
import promisify from "cypress-promise";

export interface ArrangeTest {
    arrange?: (bUnit: LeaseBusinessUnit) => Promise<void>;
    cleanup?: (bUnit: LeaseBusinessUnit) => Promise<void>;
}

export interface AAATest<P extends Page> extends ArrangeTest {
    act: (page: P, bUnit: LeaseBusinessUnit) => Promise<void>;
    assert: (page: P, bUnit: LeaseBusinessUnit) => Promise<void>;
}

type TestFn<P extends RootPage> = (title: string, aaaTest: AAATest<P>) => void;

// TODO: tags for run
export function cdpSuite<P extends Page>(
    name: string,
    TestPage: (new() => P) & { route: RootRoute<P> },
    options: Partial<ArrangeTest & LeaseManagerOptions>, // TODO: roles
    fn: (it: TestFn<P>) => void) {

    const leaseManager = createLeaseManager(options);

    const rootPath = TestPage.route.path;

    return describe(name, {}, function () { // keep as function to preserve context
        let lease: Lease;

        this.beforeAll('lease and login', async () => {
            lease = await leaseManager.lease();
            await promisify(cy.visit(`https://universe.cdp.gigya.com`)); /// TODO: env specific

            const loginPage = await RootPage.navigateTo({
                pageClass: LoginPage.route.pageClass,
                path: LoginPage.route.path.for(lease.businessUnitInfo) // TODO: can we cleanup the use of path and the leased bUnit?
            });

            await loginPage.login(lease.loginCredentials, rootPath.for(lease.businessUnitInfo));
        });

        this.beforeEach(`arrange and reset to root page: ${rootPath}`, async () => {
            if (lease.isReleased) { // to prevent releasing after the initial one (required for login)
                lease = await leaseManager.lease();
            }
            await options.arrange?.(lease.businessUnit);

            await promisify(cy.visit(`/#${rootPath.for(lease.businessUnitInfo)}`));
        });

        this.afterEach(`cleanup`, async () => {
            await options.cleanup?.(lease.businessUnit);
        });

        this.afterAll('lease release & flush logs of failed tests', async () => {
            await lease.release();
            // await promisify(cy.visit('about:blank'));
            // TODO flush logs
        });

        fn(function test(title: string, aaaTest: AAATest<P>) {
            it(title, async function () { // keep as function to preserve context
                const bUnit = lease.businessUnit;
                const page = lease.allowAccessUntilExpire(
                    new TestPage.route.pageClass()
                );

                await aaaTest.arrange?.call(this, bUnit);
                await aaaTest.act.call(this, page, bUnit);
                await aaaTest.assert.call(this, page, bUnit);
            });
        });
    });
}
