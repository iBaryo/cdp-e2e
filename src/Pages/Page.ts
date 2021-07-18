import {RootPage} from "./RootPage";

export function select(s: string) { return `[data-test=${s}]`; }

export abstract class Page {
    protected _isOpen = true;

    protected static factory<T extends Page>(targetPageClass: new () => T, originPage?: Page) {
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

    protected factory<T extends Page>(targetPageClass: new () => T) {
        return Page.factory(targetPageClass, this);
    }

    // all pages can navigate to root pages, though not all pages are root pages [see below]
    public navigateTo<T extends RootPage>(route: { menuItemSelector: string; pageClass: new () => T }): T {
        return RootPage.navigateTo(route, this);
    }
}