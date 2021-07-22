import {Page, select} from "./Page";

export interface RootRoute<T extends RootPage> { // "root route" is when we use the side-menu in order to navigate to a "root page"
    readonly menuItemSelector: string;
    readonly path: string;
    readonly pageClass: new () => T;
}

export abstract class RootPage extends Page { // root pages are also pages (can navigate to other pages)
    public static get route(): RootRoute<RootPage> { throw 'not implemented'; } // this must be implemented by deriving classes [TS doesn't support static abstract]

    public static navigateTo<T extends RootPage>(route: { menuItemSelector: string; pageClass: new () => T }, originPage?: Page): T {
        cy.get(select(`side-menu`)).click();

        if (!cy.get(route.menuItemSelector))
            throw `menu item does not exist: ${route.menuItemSelector}`;

        console.log(`navigating to... ${route.menuItemSelector}`);
        cy.get(route.menuItemSelector).click();

        return Page.factory(route.pageClass, originPage);
    }
}