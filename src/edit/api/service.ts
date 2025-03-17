/**
 * 编辑页API服务
 * 负责处理视频编辑页面的API请求
 */
import axios from 'axios';
import { ApiResponse, EditConfigResponse } from './types';

// API基础URL
const BASE_URL = '/api';

/**
 * 创建axios实例
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * 请求拦截器
 */
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证信息等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
apiClient.interceptors.response.use(
  (response) => {
    // 直接返回响应数据
    return response.data;
  },
  (error) => {
    // 统一处理错误
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

/**
 * 编辑页API服务类
 */
export class EditService {
  /**
   * 获取编辑页初始配置数据
   * @param styleId 可选的风格ID
   */
  static async getEditConfig(styleId?: string): Promise<ApiResponse<EditConfigResponse>> {
    const params = styleId ? { styleId } : {};
    return apiClient.get('/edit/config', { params });
  }

  /**
   * 提交视频编辑配置
   * @param config 编辑配置
   */
  static async submitEditConfig(config: any): Promise<ApiResponse<{ videoId: string }>> {
    return apiClient.post('/edit/submit', config);
  }
} 