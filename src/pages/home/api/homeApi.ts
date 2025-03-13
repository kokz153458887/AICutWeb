import axios from 'axios';
import { HomeApiResponse, HomeApiParams } from './homeApiModel';

/**
 * 首页API服务类
 * 负责处理首页相关的所有API请求
 */
export class HomeApiService {
  /**
   * 获取首页数据
   * @param params 请求参数
   * @returns Promise<HomeApiResponse>
   */
  static async getHomeData(params: HomeApiParams): Promise<HomeApiResponse> {
    try {
      const response = await axios.get<HomeApiResponse>('/api/home/getHomeData', {
        params,
        timeout: 10000, // 10秒超时
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // 检查响应状态
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 检查业务状态
      if (!response.data || response.data.status !== 'success') {
        throw new Error(response.data?.msg || '获取数据失败');
      }
      
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