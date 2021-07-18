import {Lease, LeaseBusinessUnit, WFS, WFSOptions} from "./WFS";
import {CDP} from "./sdk";
import {Page} from "./Pages/Page";
import {LoginPage} from "./Pages/LoginPage";
import {RootPage, RootRoute} from "./Pages/RootPage";

export interface ArrangeTest {
    arrange?: (bUnit: LeaseBusinessUnit) => Promise<void>;
}

export interface AAATest<P extends Page> extends ArrangeTest {
    act: (page: P, bUnit: LeaseBusinessUnit) => Promise<void>;
    assert: (page: P, bUnit: LeaseBusinessUnit) => Promise<void>;
}

type TestFn<P extends RootPage> = (title: string, options: AAATest<P>) => void;

export function cdpSuite<P extends Page>(
    name: string,
    TestPage: { route: RootRoute<P> },
    options: Partial<ArrangeTest & {wfsOptions: WFSOptions}>,
    fn: (it: TestFn<P>) => void) {
    const wfs = new WFS(
        new CDP(require('../creds.json'), {
            verboseLog: true,
            log(msg: string, ...args) {

            }
        }),
        options.wfsOptions
    );

    const page = new TestPage.route.pageClass();
    const rootPath = TestPage.route.path;

    return describe(name, {}, function () { // keep as function to preserve context
        let lease: Lease;

        this.beforeAll('lease and login', async () => {
            lease = await wfs.lease();
            cy.visit(`https://universe.cdp.gigya.com`); // TODO: env specific
            RootPage.navigateTo(LoginPage.route).login(lease.loginCredentials, rootPath);
        });

        this.beforeEach(`arrange and reset to root page: ${rootPath}`, async () => {
            if (lease.isReleased) {
                lease = await wfs.lease();
            }
            await options.arrange?.(lease.businessUnit);
            cy.visit(rootPath);
        });

        this.afterEach(`release lease`, async () => {
            await lease.release();
        });

        this.afterAll('flush logs of failed tests', async () => {
            // TODO
        });

        fn(function test(title: string, options: AAATest<P>) {
            it(title, async function() { // keep as function to preserve context
                const bUnit = lease.businessUnit;
                await options.arrange?.(bUnit);
                await options.act(page, bUnit);
                await options.assert(page, bUnit);
            });
        });
    });
}
