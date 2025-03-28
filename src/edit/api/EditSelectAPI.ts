/**
 * 素材库选择API服务
 * 负责处理素材库选择相关的API请求
 */
import axios from 'axios';
import { ApiResponse, MaterialListResponse, MusicLibItem } from './types';
import { API_CONFIG, API_PATHS, API_HEADERS } from '../../config/api';

/**
 * 使用与service.ts同样的axios实例
 */
const apiClient = axios.create({
  baseURL: API_CONFIG.fullBaseURL,
  timeout: API_CONFIG.timeout,
  headers: API_HEADERS
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
 * 编辑页选择器API服务
 * 负责处理编辑页各种选择器相关的API请求
 */
export class EditSelectAPI {
  /**
   * 获取素材库列表
   * @param page 页码，默认1
   * @param limit 每页记录数，默认20，设置为-1时返回所有记录
   * @returns 素材库列表响应
   */
  static async getMaterialList(page: number = 1, limit: number = -1): Promise<ApiResponse<MaterialListResponse>> {
    console.log(`[EditSelectAPI] 获取素材库列表: page=${page}, limit=${limit}`);
    
    return apiClient.get(API_PATHS.material.list, {
      params: {
        page,
        limit
      }
    });
  }

  /**
   * 获取音乐列表
   * @param page 页码，默认1
   * @param limit 每页记录数，默认20，设置为-1时返回所有记录
   * @returns 音乐列表响应
   */
  static async getMusicList(page: number = 1, limit: number = -1): Promise<ApiResponse<{data: MusicLibItem[]}>> {
    console.log(`[EditSelectAPI] 获取音乐列表: page=${page}, limit=${limit}`);
    
    return apiClient.get(API_PATHS.music.list, {
      params: {
        page,
        limit
      }
    });
  }
} 