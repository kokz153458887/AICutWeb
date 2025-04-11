/**
 * 视频操作页API服务
 */
import axios from 'axios';
import { API_CONFIG, API_PATHS, API_HEADERS, API_RESPONSE_CODE } from '../../config/api';
import { ShareTemplateResponse, QueryVideoTaskResponse, VideoOperateData } from './types';

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

/**
 * 查询视频任务详情
 * @param generateId 视频生成任务ID
 * @returns 视频任务详情数据
 */
export const queryVideoTask = async (generateId: string): Promise<VideoOperateData> => {
  try {
    console.log('请求视频任务详情, generateId:', generateId);
    
    const response = await axios.get<QueryVideoTaskResponse>(
      `${API_CONFIG.fullBaseURL}/videotask/queryVideoTask`,
      {
        params: {
          generateId
        },
        headers: API_HEADERS,
        timeout: API_CONFIG.timeout
      }
    );

    if (response.data.code === API_RESPONSE_CODE.SUCCESS && response.data.data) {
      const apiData = response.data.data;
      
      // 将API返回的数据转换为前端需要的格式
      const operateData: VideoOperateData = {
        generateId: apiData.generateId,
        title: apiData.title,
        text: apiData.text,
        createTime: apiData.createTime,
        // 根据状态字段转换为前端状态
        status: apiData.statusDetail.status === 'success' 
          ? 'done'
          : apiData.statusDetail.status === 'processing' || apiData.statusDetail.status === 'queue'
            ? 'generating'
            : 'failed',
        ratio: apiData.config?.style?.ratio || '16:9',
        materialName: apiData.config?.material?.name || '',
        videolist: apiData.videolist || []
      };
      
      return operateData;
    }

    throw new Error(response.data.message || '获取视频任务详情失败');
  } catch (error) {
    console.error('获取视频任务详情失败:', error);
    throw error;
  }
}; 