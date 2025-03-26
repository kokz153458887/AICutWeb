/**
 * 视频操作页API服务
 */
import axios from 'axios';
import { API_CONFIG, API_PATHS, API_HEADERS, API_RESPONSE_CODE } from '../../config/api';
import { ShareTemplateResponse } from './types';

/**
 * 从视频任务创建模版
 * @param videoTaskId 视频任务ID
 * @param videoIndex 视频索引
 */
export const createFromVideoTask = async (videoTaskId: string, videoIndex: number): Promise<ShareTemplateResponse> => {
  try {
    const response = await axios.get<ShareTemplateResponse>(
      `${API_CONFIG.fullBaseURL}/edit/createFromVideoTask`,
      {
        params: {
          videoTaskId,
          videoIndex
        },
        headers: API_HEADERS,
        timeout: API_CONFIG.timeout
      }
    );

    if (response.data.code === API_RESPONSE_CODE.SUCCESS) {
      return response.data;
    }

    throw new Error(response.data.message || '创建模版失败');
  } catch (error) {
    console.error('创建模版失败:', error);
    throw error;
  }
}; 