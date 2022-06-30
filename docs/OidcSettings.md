# OIDC Settings

## OIDC Config

In `./src/services/ant-design-pro/auth.ts` file.

```typescript
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
```
