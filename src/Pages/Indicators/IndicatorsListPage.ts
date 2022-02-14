import {RootPage, UniversePath} from "../RootPage";
import {select} from "../Page";
import {ActivityIndicatorPage} from "./ActivityIndicatorPage";
import {BusinessUnitInfo} from "../../WFS/LeaseInfo";

export class IndicatorsListPage extends RootPage {
    public static get route() {
        return {
            menuItemSelector: select('activity-indicators-app'),
            path: {
                for(ctx: BusinessUnitInfo): UniversePath {
                    return `/tenant/${ctx.tenantId}/workspace/${ctx.workspaceId}/business-unit/${ctx.bUnitId}/customers/indicators`;
                }
            },
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
