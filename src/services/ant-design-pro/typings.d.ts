// @ts-ignore
/* eslint-disable */

declare namespace API {
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

  type LoginResult = {
    status?: string;
    type?: string;
    currentAuthority?: string;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
  };

  type ErrorResponse = {
    error: Error;
  };

  type Error = {
    code?: string;
    data?: any;
    details?: string;
    message?: string;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };
}
