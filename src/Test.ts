import {Lease, LeaseBusinessUnit, WFS, WFSOptions} from "./WFS";
import {CDP} from "./sdk";
import {Page, RootPage, RootRoute, SegmentsListPage} from "./Pages/Page";
import {LoginPage} from "./Pages/LoginPage";


export interface TestArrange {
    arrange?: (bUnit: LeaseBusinessUnit) => Promise<void>;
}

export interface AAAOptions<P extends Page> extends TestArrange {
    act: (page: P, bUnit: LeaseBusinessUnit) => Promise<void>;
    assert: (page: P, bUnit: LeaseBusinessUnit) => Promise<void>;
}


export function cdpSuite<P extends Page>(
    name: string,
    TestPage: { route: RootRoute<P> },
    options: Partial<TestArrange & {wfsOptions: WFSOptions}>,
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

    return describe(name, {}, function () {
        let lease: Lease;

        this.beforeAll('lease and login', async () => {
            lease = await wfs.lease();
            cy.visit(`https://universe.cdp.gigya.com`); // TODO: env specific
            Page.navigateTo(LoginPage.route).login(lease.loginCredentials, rootPath);
        });

        this.beforeEach('arrange and reset to root page', async () => {
            await options.arrange?.(lease.businessUnit);
            cy.visit(rootPath);
        });

        this.afterEach('clean the leased bUnit', async () => {
            await lease.clean();
        });

        this.afterAll('flush logs of failed tests', async () => {
            // TODO
        });

        fn(leaseTestFactory(lease, page));
    });
}

type TestFn<P extends RootPage> = (title: string, options: AAAOptions<P>) => void;


function leaseTestFactory<P extends RootPage>(bUnit: LeaseBusinessUnit, page: P): TestFn<P> {
    return function test(title: string, options: AAAOptions<P>) {
        it(title, async () => {
            await options.arrange?.(bUnit);
            await options.act(page, bUnit);
            await options.assert(page, bUnit);
        });
    };
}

cdpSuite('', SegmentsListPage, {}, test => {
    test('', {
        arrange: async (bUnit) => {
            bUnit
        },
        act: page => {
            page.getSegmentsList();
            return Promise.resolve();
        },
        assert: async (page, bUnit) => {
        }
    });
});
