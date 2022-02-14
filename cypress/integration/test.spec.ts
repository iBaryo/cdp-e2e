import {cdpSuite} from "../../src/CdpSuite";
import {SegmentsListPage} from "../../src/Pages/Segments/SegmentsListPage";
import {IndicatorsListPage} from "../../src/Pages/Indicators/IndicatorsListPage";
import {LoginPage} from "../../src/Pages/LoginPage";

cdpSuite('testing something', IndicatorsListPage, {
    arrange: async bUnit => {
        debugger;
    }
}, it => {

    it('title', {
        arrange: async bUnit => {
            debugger;
        },
        act: async (page, bUnit) => {
            debugger;
        },
        assert: async (page, bUnit) => {
            debugger;
        }
    })

});