import {RootPage} from "./Page";

export class LoginPage extends RootPage {

    public static get route() {
        return {
            menuItemSelector: null, // need to logout
            path: '',
            pageClass: this
        };
    }

    public login(creds: { username: string, password: string }, redirectTo?: string) {

    }
}
