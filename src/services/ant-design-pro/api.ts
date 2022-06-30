// @ts-ignore
/* eslint-disable */
import { request as umiRequest } from 'umi';
import { RequestResponse, RequestOptionsWithResponse, RequestOptionsWithoutResponse, RequestOptionsInit } from 'umi-request';
import { getUser } from './auth';

/** 获取当前的用户 GET /api/account/my-profile */
export async function myProfile(options?: { [key: string]: any }) {
  return abpRequest<API.Profile>('/api/account/my-profile', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return abpRequest<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    currentPage?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return abpRequest<API.RuleList>('/api/identity/roles/table', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 新建规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return abpRequest<API.RuleListItem>('/api/rule', {
    method: 'PUT',
    ...(options || {}),
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return abpRequest<API.RuleListItem>('/api/rule', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return abpRequest<Record<string, any>>('/api/rule', {
    method: 'DELETE',
    ...(options || {}),
  });
}

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
