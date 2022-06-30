import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { message } from 'antd';
import { BookOutlined, LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { PageLoading, SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from 'umi';
import { history, Link, RequestConfig } from 'umi';
import defaultSettings from '../config/defaultSettings';
import { getUser, signinRedirect, signinRedirectCallback, signinSilent, signinSilentCallback, signoutRedirectCallback } from './services/ant-design-pro/auth';
import { myProfile as queryMyProfile } from './services/ant-design-pro/api';

const isDev = process.env.NODE_ENV === 'development';
const signinRedirectCallbackPath = '/signin-redirect-callback';
const signinSilentCallbackPath = '/signin-silent-callback';
const signoutRedirectCallbackPath = '/signout-redirect-callback';
const consolePath = '/welcome';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
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

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser) {
        history.push('401');
        signinRedirect();
      }
    },
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
          <Link to="/~docs" key="docs">
            <BookOutlined />
            <span>业务组件文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children, props) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {!props.location?.pathname?.includes('/login') && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};
