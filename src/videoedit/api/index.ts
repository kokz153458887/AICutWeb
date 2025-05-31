/**
 * 视频剪辑相关API接口
 * 负责获取解析任务详情
 */
import axios from 'axios';
import { API_CONFIG, API_HEADERS, API_RESPONSE_CODE } from '../../config/api';
import { ParseTaskDetail } from '../types';

// API通用响应接口
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 获取解析任务详情
 * @param taskId 任务ID
 * @param needSegments 是否需要segments数据
 * @returns 解析任务详情
 */
export const getParseTaskDetail = async (id: string, needSegments: boolean = true): Promise<ParseTaskDetail> => {
  try {
    const response = await axios.get<ApiResponse<ParseTaskDetail>>(
      '/video/parse/task',
      {
        baseURL: API_CONFIG.fullBaseURL,
        params: {
          id,
          needSegments
        },
        timeout: API_CONFIG.timeout,
        headers: API_HEADERS
      }
    );
    
    if (response.data.code === API_RESPONSE_CODE.SUCCESS) {
      return response.data.data;
    }
    throw new Error(response.data.message || '获取解析任务详情失败');
  } catch (error) {
    console.error('获取解析任务详情失败:', error);
    throw error;
  }
}; 