import {RootPage, RootRoute} from "./RootPage";

export class LoginPage extends RootPage {

    public static get route(): RootRoute<LoginPage> {
        return {
            menuItemSelector: '', // need to logout
            path: '',
            pageClass: this
        };
    }

    public login(creds: { username: string, password: string }, redirectTo?: string) {

    }
}
