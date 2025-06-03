/**
 * 编辑页API服务
 * 负责处理视频编辑页面的API请求
 */
import axios from 'axios';
import { ApiResponse, EditConfigResponse, VideoEditConfig, VideoGenerateResponse, AutoGenerateTextRequest, AutoGenerateTextResponse, UnlikeTextRequest, UnlikeTextResponse } from './types';
import { API_CONFIG, API_PATHS, API_HEADERS } from '../../config/api';

/**
 * 创建axios实例
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
 * 编辑页API服务类
 */
export class EditService {
  /**
   * 获取编辑页初始配置数据
   * @param params 所有URL参数
   */
  static async getEditConfig(params: Record<string, string>): Promise<ApiResponse<EditConfigResponse>> {
    console.log("getEditConfig params:", params);
    return apiClient.get(API_PATHS.edit.getConfig, { params });
  }

  /**
   * 提交视频编辑配置，生成视频模板
   * @param config 编辑配置
   * @param params URL参数
   * @returns 包含生成ID和成功跳转URL的响应
   */
  static async createConfig(
    config: VideoEditConfig, 
    params: Record<string, string>
  ): Promise<ApiResponse<VideoGenerateResponse>> {
    const formattedData = {
      config: config,
      params: params
    };
    
    return apiClient.post(API_PATHS.edit.createConfig, formattedData);
  }

  /**
   * 更新视频编辑配置
   * @param config 编辑配置
   * @param params URL参数
   * @returns 包含生成ID和成功跳转URL的响应
   */
  static async updateConfig(
    config: VideoEditConfig, 
    params: Record<string, string>
  ): Promise<ApiResponse<VideoGenerateResponse>> {
    const formattedData = {
      config: config,
      params: params
    };
    
    return apiClient.post(API_PATHS.edit.updateConfig, formattedData);
  }

  /**
   * 生成视频
   * @param config 编辑配置
   * @param params URL参数
   * @returns 包含生成ID和成功跳转URL的响应
   */
  static async generateVideo(
    config: VideoEditConfig, 
    params: Record<string, string>
  ): Promise<ApiResponse<VideoGenerateResponse>> {
    const formattedData = {
      config: config,
      params: params
    };
    
    return apiClient.post(API_PATHS.edit.generate, formattedData);
  }

  /**
   * 自动生成生活小妙招文本
   * @param params 生成参数
   * @returns 生成的文本内容
   */
  static async autoGenerateText(params: AutoGenerateTextRequest): Promise<AutoGenerateTextResponse> {
    return apiClient.post(API_PATHS.edit.autoGenerateText, params);
  }

  /**
   * 标记文案为不喜欢
   * @param params 不喜欢参数
   * @returns 操作结果
   */
  static async unlikeText(params: UnlikeTextRequest): Promise<UnlikeTextResponse> {
    return apiClient.post(API_PATHS.edit.unlikeText, params);
  }
} 