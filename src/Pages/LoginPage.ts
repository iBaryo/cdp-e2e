import {RootPage, RootRoute} from "./RootPage";
import {BusinessUnitInfo} from "../WFS/LeaseInfo";
import promisify from "cypress-promise";

export class LoginPage extends RootPage {

    public static get route(): RootRoute<LoginPage> {
        return {
            menuItemSelector: undefined, // need to logout
            path: {
                for(ctx: BusinessUnitInfo) {
                    return '/auth/login';
                }
            },
            pageClass: this
        };
    }

    public login(creds: { username: string; password: string; }, redirectTo?: string) {
        this.username.type(creds.username);
        this.password.type(creds.password);
        return promisify(
            this.submit.click().then(() => {
                cy.url().then(url => {
                    if (url.includes('login')) {
                        cy.log('*** has login in url ***');
                        this.tfaField.type('someTFA');
                        this.tfaSubmitButton.should('be.visible').click({force: true, timeout: 5000});
                    }
                });
            })
        );
    }

    public get username() {
        return cy.get('#screen-set-container input.gigya-input-text[name="username"]', {timeout: 45000});
    }

    public get password() {
        return cy.get('#screen-set-container input.gigya-input-password[name="password"]', {timeout: 1000});
    }

    public get submit() {
        return cy.get('#screen-set-container input.gigya-input-submit', {timeout: 1000});
    }

    get tfaField() {
        return cy.get('#screen-set-container input.gig-tfa-code-textbox', {timeout: 10000});
    }

    get tfaSubmitButton() {
        return cy.get('#screen-set-container div.gig-tfa-button-submit', {timeout: 10000});
    }
}
