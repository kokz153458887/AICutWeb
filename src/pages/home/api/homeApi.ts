import axios from 'axios';
import { HomeApiResponse, HomeApiParams } from './homeApiModel';
import { API_CONFIG, API_PATHS, API_HEADERS, API_RESPONSE_CODE } from '../../../config/api';

/**
 * 首页API服务类
 * 负责处理首页相关的所有API请求
 */
export class HomeApiService {
  /**
   * 获取首页数据
   * @param tabId 标签ID
   * @param params 请求参数
   * @returns Promise<HomeApiResponse>
   */
  static async getHomeData(tabId: string, params?: Partial<HomeApiParams>): Promise<HomeApiResponse> {
    try {
      // 合并默认参数和传入的参数
      const mergedParams: HomeApiParams = {
        tab: tabId,
        pageNum: params?.pageNum || 1,
        pageSize: params?.pageSize || 10,
        ...params
      };
      
      console.log(`[HomeApi] 发起请求: tab=${mergedParams.tab}, pageNum=${mergedParams.pageNum}, pageSize=${mergedParams.pageSize}`);
      
      // 发起真实的API请求
      const response = await axios.get<HomeApiResponse>(API_PATHS.home.getHomeData, {
        baseURL: API_CONFIG.fullBaseURL,
        params: mergedParams,
        timeout: API_CONFIG.timeout,
        headers: API_HEADERS
      });
      
      // 检查响应状态
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 检查业务状态
      if (!response.data || response.data.status !== 'success') {
        throw new Error(response.data?.msg || '获取数据失败');
      }
      
      console.log(`[HomeApi] 请求成功: 获取到${response.data.data.content.length}条数据, 第一条ID: ${response.data.data.content[0]?.styleId || 'N/A'}, 最后一条ID: ${response.data.data.content[response.data.data.content.length - 1]?.styleId || 'N/A'}`);
      
      return response.data;
    } catch (error) {
      // 统一错误处理
      if (axios.isAxiosError(error)) {
        // Axios 特定错误
        if (error.response) {
          // 服务器返回了错误响应
          throw new Error(`服务器错误: ${error.response.status}`);
        } else if (error.request) {
          // 请求已发送但没有收到响应
          throw new Error('未收到服务器响应，请检查网络连接');
        } else {
          // 请求配置出错
          throw new Error(`请求配置错误: ${error.message}`);
        }
      }
      // 重新抛出其他错误
      throw error;
    }
  }
} 