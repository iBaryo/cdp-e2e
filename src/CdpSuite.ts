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

type TestFn<P extends RootPage> = (title: string, aaaTest: AAATest<P>) => void;

// TODO: tags for run

export function cdpSuite<P extends Page>(
    name: string,
    TestPage: (new() => P) & { route: RootRoute<P> },
    options: Partial<ArrangeTest & {wfsOptions: WFSOptions}>, // TODO: roles
    fn: (it: TestFn<P>) => void) {

    const wfs = new WFS(
        new CDP(require('../creds.json'), {
            sendRequest: async <T>(req, reqOptions) => {
                // TODO: cy.request
                return null;
            },
            verboseLog: true,
            log(msg: string, ...args) {
                // TODO: logs?
            }
        }),
        options.wfsOptions
    );

    const page = new TestPage.route.pageClass(); // TODO: proxy to enable access only before lease timeout
    const rootPath = TestPage.route.path;

    return describe(name, {}, function () { // keep as function to preserve context
        let lease: Lease;

        this.beforeAll('lease and login', async () => {
            lease = await wfs.lease();
            cy.visit(`https://universe.cdp.gigya.com`); // TODO: env specific
            RootPage.navigateTo(LoginPage.route).login(lease.loginCredentials, rootPath);
        });

        this.beforeEach(`arrange and reset to root page: ${rootPath}`, async () => {
            if (lease.isReleased) { // to prevent releasing after the initial one (required for login)
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

        fn(function test(title: string, aaaTest: AAATest<P>) {
            it(title, async function() { // keep as function to preserve context
                const bUnit = lease.businessUnit;
                await aaaTest.arrange?.(bUnit);
                await aaaTest.act(page, bUnit);
                await aaaTest.assert(page, bUnit);
            });
        });
    });
}
