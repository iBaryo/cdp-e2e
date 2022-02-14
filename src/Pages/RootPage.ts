import {Page, select} from "./Page";
import {BusinessUnitInfo} from "../WFS/LeaseInfo";
import promisify from "cypress-promise";

type WithPageClass<T extends RootPage> = {
    readonly pageClass: new () => T;
};

export type UniversePath = `/${string}`;

export interface RootRoute<T extends RootPage> extends WithPageClass<T> { // "root route" is when we use the side-menu in order to navigate to a "root page"
    readonly menuItemSelector: string;
    readonly path: { for(ctx: BusinessUnitInfo): UniversePath };
}

type PageNavigation<T extends RootPage> = WithPageClass<T> & (
    { readonly menuItemSelector: string; }
    | { readonly path: UniversePath }
    )

export abstract class RootPage extends Page { // root pages are also pages (can navigate to other pages)
    public static get route(): RootRoute<RootPage> {
        throw 'not implemented';
    } // this must be implemented by deriving classes [TS doesn't support static abstract]

    public static async navigateTo<T extends RootPage>(route: PageNavigation<T>, originPage?: Page): Promise<T> {
        if ('path' in route) {
            await promisify(cy.visit(`/#${route.path}`));
        } else {
            cy.get(select(`side-menu`)).click();

            if (!cy.get(route.menuItemSelector))
                throw `menu item does not exist: ${route.menuItemSelector}`;

            console.log(`navigating to... ${route.menuItemSelector}`);
            cy.get(route.menuItemSelector).click();
        }

        return Page.factory(route.pageClass, originPage);
    }
}