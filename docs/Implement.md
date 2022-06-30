# Implement

## Steps

### 1. Add `./src/services/ant-design-pro/auth.ts` file.

You should modify the `baseUrl` and `oidcConfig`.

```typescript
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
```

### 2. Modify `./src/services/ant-design-pro/typings.d.ts` file.

Overrite `CurrentUser` To `Profile`.

```typescript
  type IdentityUserExtraProperties = {
    Avatar?: string;
    Birthday?: string;
    IDCardNumber?: string;
    IDCardNumberConfirmed?: boolean;
    IdentityType?: number;
    JobNumber?: string;
    MemberPoint?: number;
    OuterId?: string;
    Sex?: number;
    StudentNumber?: string;
  }

  type Profile = {
    userName?: string;
    email?: string;
    name?: string;
    surname?: string;
    phoneNumber?: string;
    isExternal?: boolean;
    hasPassword?: boolean;
    extraProperties?: IdentityUserExtraProperties;
  };
```

Overrite `ErrorResponse`.

```typescript
  type ErrorResponse = {
    error: Error;
  };

  type Error = {
    code?: string;
    data?: any;
    details?: string;
    message?: string;
  };
```

### 3. Secondary packaging `umi-request`.

Open the `./src/services/ant-design-pro/api.ts` file, and add abpRequest with [umi-request](https://v3.umijs.org/zh-CN/plugins/plugin-request).

```typescript
interface RequestMethodInUmi<R = false> {
  <T = any>(
    url: string,
    options: RequestOptionsWithResponse & { skipErrorHandler?: boolean },
  ): Promise<RequestResponse<T>>;
  <T = any>(
    url: string,
    options: RequestOptionsWithoutResponse & { skipErrorHandler?: boolean },
  ): Promise<T>;
  <T = any>(
    url: string,
    options?: RequestOptionsInit & { skipErrorHandler?: boolean },
  ): R extends true ? Promise<RequestResponse<T>> : Promise<T>;
}

const abpRequest: RequestMethodInUmi = async <T> (url: any, options: any) => {
  const user = await getUser();

  return umiRequest<T>(url, {
    headers: user && user.access_token ? { 'Authorization': `Bearer ${user.access_token}` } : {},
    ...(options || {}),
  });
};
```

Replace `request` with `abpRequest`, and add `myProfile` function.

```typescript
/** 获取当前的用户 GET /api/account/my-profile */
export async function myProfile(options?: { [key: string]: any }) {
  return abpRequest<API.Profile>('/api/account/my-profile', {
    method: 'GET',
    ...(options || {}),
  });
}
```

### 4. Overrite `./src/app.tsx`.

Add `signinRedirectCallbackPath`, `signinSilentCallbackPath`, `signoutRedirectCallbackPath`, `consolePath`.

```typescript
const signinRedirectCallbackPath = '/signin-redirect-callback';
const signinSilentCallbackPath = '/signin-silent-callback';
const signoutRedirectCallbackPath = '/signout-redirect-callback';
const consolePath = '/welcome';
```

Overrite `getInitialState` function.

```typescript
 export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.Profile;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.Profile | undefined>;
}> {
  console.log('location', history.location.pathname);

  const fetchUserInfo = async () => {
    try {
      let user;
      if (history.location.pathname === signinRedirectCallbackPath) {
        user = await signinRedirectCallback();
      } else if (history.location.pathname === signinSilentCallbackPath) {
        user = await signinSilentCallback();
      } else {
        user = await getUser();
      }
    
      console.log('getUser', user);

      const profile = await queryMyProfile();
      return profile;
    } catch (error) {
      signinRedirect();
    }
    return undefined;
  };

  if (history.location.pathname === signoutRedirectCallbackPath) {
    await signoutRedirectCallback();
  }

  const currentUser = await fetchUserInfo();

  if (currentUser) {
    history.push(consolePath);

    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
    };
  }

  history.push('401');
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}
```

Add `RequestConfig`.

```typescript
export const request: RequestConfig = {
  timeout: 2000,
  responseInterceptors: [
    async response => {
      if (response.status === 200 || response.status === 204) {

      } else if (response.status === 401) {
        const user = await getUser();
        if (user && user.refresh_token) {
          await signinSilent();
        } else {
          history.push('401');
          await signinRedirect();
        }
      } else {
        let errorResponse = {} as API.ErrorResponse;
        const json = await response.clone().json();
        errorResponse = Object.assign(errorResponse, json);
        console.log(response.url, errorResponse);
        message.error(errorResponse.error.details ? errorResponse.error.details : errorResponse.error.message);
      }

      return response;
    },
  ],
};
```

Overrite `onPageChange`.

```typescript
    onPageChange: () => {
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser) {
        history.push('401');
        signinRedirect();
      }
    },
```

### 5. Modify `./src/components/RightContent/AvatarDropdown.tsx`.

Replace `outLogin` with `signoutRedirect`.

```typescript
const signinRedirectCallbackPath = '/signin-redirect-callback';
const signinSilentCallbackPath = '/signin-silent-callback';
const signoutRedirectCallbackPath = '/signout-redirect-callback';
const consolePath = '/welcome';
```

### 6. Run

```shell
rm -Force src/.umi
yarn
yarn start
```