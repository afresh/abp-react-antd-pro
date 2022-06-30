# ABP Settings

## Client Config

In `.DbMigrator/appsettings.json` file.

```json
"IdentityServer": {
    "Clients": {
        "ABP_App": {
        "ClientId": "ABP_App", //Your client application's identifier as registered with the OIDC/OAuth2 provider.
        "RootUrl": "http://localhost:4200" //app base url
        },
        "ABP_Swagger": {
        "ClientId": "ABP_Swagger",
        "RootUrl": "https://localhost:44341"
        }
    }
}
```

In `.Domain/IdentityServer/IdentityServerDataSeedContributor.cs` file.

```csharp
//Console Test / Angular Client
var consoleAndAngularClientId = configurationSection["ABP_App:ClientId"];
if (!consoleAndAngularClientId.IsNullOrWhiteSpace())
{
    var webClientRootUrl = configurationSection["ABP_App:RootUrl"]?.TrimEnd('/');

    await CreateClientAsync(
        name: consoleAndAngularClientId,
        scopes: commonScopes,
        grantTypes: new[] { "password", "client_credentials", "authorization_code" },
        secret: (configurationSection["ABP_App:ClientSecret"] ?? ABPConsts.DefaultClientSecret).Sha256(),
        requireClientSecret: false,
        redirectUri: $"{webClientRootUrl}/signin-redirect-callback", //The redirect URI of your client application to receive a response from the OIDC/OAuth2 provider.
        postLogoutRedirectUri: $"{webClientRootUrl}/signout-redirect-callback", //The redirect URI of your client application to receive a response from the OIDC/OAuth2 provider.
        corsOrigins: new[] { webClientRootUrl.RemovePostFix("/") }
    );
}
```

Then, rebuild your database or add new client instead of modifing the `ABP_App`.
