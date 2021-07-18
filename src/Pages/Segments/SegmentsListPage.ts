import {RootPage} from "../RootPage";
import {select} from "../Page";

export class SegmentsListPage extends RootPage {

    public static get route() {
        return {
            menuItemSelector: select('segments-app'),
            path: 'segments-app',
            pageClass: this
        };
    }

    // additional methods...
    public getSegmentsList(): string[] {
        console.log(`returning segments list`);
        return [];
    }
}