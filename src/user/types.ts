/**
 * 用户模块类型定义
 * 包含用户信息、登录相关的所有接口类型
 */

// 用户信息接口
export interface UserInfo {
  id: string;
  username: string;
  role: string;
  points: number;
  isMember: boolean;
}

// 登录请求参数接口
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应数据接口
export interface LoginResponse {
  user: UserInfo;
  token: string;
  expiresIn: string;
}

// 登录API响应接口
export interface LoginApiResponse {
  code: number;
  message: string;
  data: LoginResponse;
}

// Token存储信息接口
export interface TokenInfo {
  token: string;
  expiresIn: string;
  loginTime: number; // 登录时间戳
  user: UserInfo;
}

// 权限检查结果接口
export interface AuthCheckResult {
  isAuthenticated: boolean;
  needLogin: boolean;
  user?: UserInfo;
} 