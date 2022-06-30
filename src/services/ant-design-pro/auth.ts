import type { User, SignoutResponse } from 'oidc-client';
import { Log, UserManager } from 'oidc-client';

const baseUrl = 'http://localhost:4200'; //app base url

// https://github.com/IdentityModel/oidc-client-js/wiki#required-settings
const oidcConfig = {
    authority: 'https://localhost:44330', //The URL of the OIDC/OAuth2 provider.
    client_id: 'ABP_App', //Your client application's identifier as registered with the OIDC/OAuth2 provider.
    response_type: 'code', //The type of response desired from the OIDC/OAuth2 provider.
    redirect_uri: `${baseUrl}/signin-redirect-callback`, //The redirect URI of your client application to receive a response from the OIDC/OAuth2 provider.
    silent_redirect_uri: `${baseUrl}/signin-silent-callback`,
    post_logout_redirect_uri: `${baseUrl}/signout-redirect-callback`,
    scope: 'offline_access ABP_App' //The scope being requested from the OIDC/OAuth2 provider.
};

const userManager = new UserManager(oidcConfig);
Log.logger = console;
Log.level = Log.INFO;

export async function getUser(): Promise<User | null> {
    const user = await userManager.getUser();
    return user;
}

export async function signinRedirect(): Promise<void> {
    return userManager.signinRedirect();
}

export async function signinRedirectCallback(): Promise<User> {
    return userManager.signinRedirectCallback();
}

export async function signinSilent(): Promise<User> {
    return userManager.signinSilent();
}

export async function signinSilentCallback(): Promise<User | undefined> {
    return userManager.signinSilentCallback();
}

export async function signoutRedirect(): Promise<void> {
    return userManager.signoutRedirect();
}

export async function signoutRedirectCallback(): Promise<SignoutResponse> {
    return userManager.signoutRedirectCallback();
}
