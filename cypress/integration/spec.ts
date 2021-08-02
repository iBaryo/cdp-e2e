import {cdpSuite} from "../../src/CdpSuite";
import {ActivityIndicatorsListPage} from "../../src/Pages/ActivityIndicators/ActivityIndicatorsListPage";
import cypress = require("cypress");
import promisify from "cypress-promise";


it('basic', () => {
    expect(true).to.eq(true);
});

describe('sanity suite', () => {
    it('sanity', () => {
        console.log(`sanity time!`);
        expect(true).to.eq(true);
    });
    it('TS sanity', () => {

        const x = {} as any;
        const res = x.a?.b?.c ?? 42;
        console.log(res);
    });


    it('async sanity', async () => {
        await Promise.resolve();
        Cypress.log({message: '1. native promise'});

        await new Promise(r => setTimeout(r, 1));
        Cypress.log({message: '2. native promise with timeout'});

        await new Cypress.Promise(r => setTimeout(r, 1));
        Cypress.log({message: '3. cypress  promise with timeout'});

        await promisify(cy.get('*'));
        Cypress.log({message: '4. promisifying cypress op'});

        // await cy.get('*').promisify();
        // Cypress.log({message: '5. chain-promisifying cypress op'});


        expect(true).to.eq(true);
    });
});

