import {RootPage} from "../RootPage";
import {select} from "../Page";
import {ActivityIndicatorPage} from "./ActivityIndicatorPage";

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
