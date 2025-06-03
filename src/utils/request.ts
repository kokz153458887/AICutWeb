/**
 * HTTP请求工具类
 * 封装了基本的HTTP请求方法
 */
import { ApiResponse } from '../types/api';

/**
 * 基础请求配置
 */
interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

/**
 * 处理响应数据
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

/**
 * 构建URL
 */
function buildUrl(url: string, params?: Record<string, string>): string {
  if (!params) return url;
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, value);
  });
  return `${url}?${searchParams.toString()}`;
}

/**
 * 请求工具类
 */
export const request = {
  /**
   * GET请求
   */
  async get<T>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { params, ...restConfig } = config;
    const response = await fetch(buildUrl(url, params), {
      method: 'GET',
      ...restConfig,
    });
    return handleResponse<T>(response);
  },

  /**
   * POST请求
   */
  async post<T>(url: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { params, ...restConfig } = config;
    const response = await fetch(buildUrl(url, params), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...restConfig.headers,
      },
      body: JSON.stringify(data),
      ...restConfig,
    });
    return handleResponse<T>(response);
  },

  /**
   * PUT请求
   */
  async put<T>(url: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { params, ...restConfig } = config;
    const response = await fetch(buildUrl(url, params), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...restConfig.headers,
      },
      body: JSON.stringify(data),
      ...restConfig,
    });
    return handleResponse<T>(response);
  },

  /**
   * DELETE请求
   */
  async delete<T>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { params, ...restConfig } = config;
    const response = await fetch(buildUrl(url, params), {
      method: 'DELETE',
      ...restConfig,
    });
    return handleResponse<T>(response);
  },
}; 