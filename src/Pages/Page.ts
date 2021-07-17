function select(s: string) { return `[data-test=${s}]`; }


export interface RootRoute<T extends RootPage> { // "root route" is when we use the side-menu in order to navigate to a "root page"
    readonly menuItemSelector: string;
    readonly pageClass: new () => T;
    readonly path: string;
}

export abstract class Page {
    protected _isOpen = true;

    private static factory<T extends Page>(targetPageClass: new () => T, originPage?: Page) {
        if (originPage)
            originPage._isOpen = false;
        return new Proxy(new targetPageClass(), {
            get: (target, prop) => {
                if (!target._isOpen)
                    throw 'page is not open';

                return target[prop as keyof T];
            }
        });
    }

    public static navigateTo<T extends RootPage>(route: { menuItemSelector: string; pageClass: new () => T }, originPage?: Page): T {
        cy.get(select(`side-menu`)).click();

        if (!cy.get(route.menuItemSelector))
            throw `menu item does not exist: ${route.menuItemSelector}`;

        console.log(`navigating to... ${route.menuItemSelector}`);
        cy.get(route.menuItemSelector).click();

        return this.factory(route.pageClass, originPage);
    }


    protected factory<T extends Page>(targetPageClass: new () => T) {
        return Page.factory(targetPageClass, this);
    }

    // all pages can navigate to root pages, though not all pages are root pages [see below]
    public navigateTo<T extends RootPage>(route: { menuItemSelector: string; pageClass: new () => T }): T {
        return Page.navigateTo(route, this);
    }
}

export abstract class RootPage extends Page { // root pages are also pages (can navigate to other pages)
    public static get route(): RootRoute<RootPage> { throw 'not implemented'; } // this must be implemented by deriving classes [TS doesn't support static abstract]
}

export class SegmentsListPage extends RootPage {

    public static get route() {
        return {
            menuItemSelector: select('segments-app'),
            path: '',
            pageClass: this
        };
    }

    // additional methods...
    public getSegmentsList(): string[] {
        console.log(`returning segments list`);
        return [];
    }
}

export class ActivityIndicatorsListPage extends RootPage {

    public static get route() {
        return {
            menuItemSelector: select('activity-indicators-app'),
            path: '',
            pageClass: this
        };
    }

    // additional methods...
    public getIndicatorsList(): string[] {
        console.log(`returning indicators list`);
        return [];
    }

    public navigateToActivityIndicator(actIndName: string) {
        cy.get(select(actIndName)).click();
        return this.factory(ActivityIndicatorPage);
    }
}

export class ActivityIndicatorPage extends Page {
    public get calcMethod() { console.log(`returning calc method`); return ''; }
}


function myTest() {
    const segsPage = Page.navigateTo(SegmentsListPage.route);
    segsPage.getSegmentsList();

    const actIndsListPage = segsPage.navigateTo(ActivityIndicatorsListPage.route);
    actIndsListPage.getIndicatorsList();

    const actIndPage = actIndsListPage.navigateToActivityIndicator('purchaseSum');
    const calcMethod = actIndPage.calcMethod;

    actIndPage.navigateTo(SegmentsListPage.route).getSegmentsList();


    // actIndPage.calcMethod; // <-- should throw as we've navigated from the page
}

// myTest();
