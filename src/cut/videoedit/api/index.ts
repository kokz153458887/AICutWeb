/**
 * 视频剪辑相关API接口
 * 负责获取解析任务详情
 */
import axios from 'axios';
import { API_CONFIG, API_HEADERS, API_RESPONSE_CODE } from '../../../config/api';
import { ParseTaskDetail, VideoClipItem } from '../index';
import { MaterialLibItem } from '../../../edit/api/types';

// API通用响应接口
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 裁剪参数接口
export interface CropParams {
  cropStartXRatio?: number;
  cropStartYRatio?: number;
  cropEndXRatio?: number;
  cropEndYRatio?: number;
  // 可选的额外信息，用于调试和验证
  cropStartX?: number;
  cropStartY?: number;
  cropEndX?: number;
  cropEndY?: number;
  originalWidth?: number;
  originalHeight?: number;
}

// 切片参数接口
interface ClipParams {
  name: string;
  folder: string;
  beginTime: string;
  endTime: string;
  text: string;
}

// 添加素材视频请求参数
interface AddMaterialVideoRequest {
  id: string;
  parse_url: string;
  video_url: string;
  text: string;
  needRemoveSubtitle: boolean;
  materialUrl: string;
  materialId: string;
  type: string;
  subtype: string;
  crop?: CropParams;
  clips: ClipParams[];
}

// 添加素材视频响应
interface AddMaterialVideoResponse {
  id: string;
  message: string;
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

/**
 * 清理切片名称，去除非法字符
 */
const cleanFileName = (name: string): string => {
  return name.replace(/[\r\n\s\t\u00A0\u2000-\u200B\u2028\u2029]+/g, '').trim();
};

/**
 * 格式化时间为 HH:MM:SS.mmm 格式
 */
const formatTimeForAPI = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const ms = Math.round((secs - Math.floor(secs)) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${Math.floor(secs).toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
};

/**
 * 添加素材视频
 * @param params 请求参数
 * @returns 处理结果
 */
export const addMaterialVideo = async (params: {
  taskData: ParseTaskDetail;
  clips: VideoClipItem[];
  selectedMaterial: MaterialLibItem;
  needRemoveSubtitle: boolean;
  cropParams?: CropParams;
}): Promise<AddMaterialVideoResponse> => {
  try {
    const { taskData, clips, selectedMaterial, needRemoveSubtitle, cropParams } = params;
    
    // 构建请求体
    const requestBody: AddMaterialVideoRequest = {
      id: taskData.id,
      parse_url: taskData.parse_url,
      video_url: taskData.video_url || '',
      text: taskData.text || '',
      needRemoveSubtitle,
      materialUrl: selectedMaterial.url || '',
      materialId: selectedMaterial._id,
      type: selectedMaterial.contentType || '',
      subtype: selectedMaterial.contentSubtype || '',
      crop: cropParams || {
        cropStartX: 0,
        cropStartY: 0,
        cropEndX: -1,
        cropEndY: -1
      },
      clips: clips.map(clip => ({
        name: cleanFileName(clip.title || ''),
        folder: cleanFileName(clip.folder || ''),
        beginTime: formatTimeForAPI(clip.startTime),
        endTime: formatTimeForAPI(clip.endTime),
        text: clip.text
      }))
    };

    const response = await axios.post<ApiResponse<AddMaterialVideoResponse>>(
      '/video/parse/addMaterialVideo',
      requestBody,
      {
        baseURL: API_CONFIG.fullBaseURL,
        timeout: API_CONFIG.timeout,
        headers: API_HEADERS
      }
    );
    
    if (response.data.code === API_RESPONSE_CODE.SUCCESS) {
      return response.data.data;
    }
    throw new Error(response.data.message || '添加素材视频失败');
  } catch (error) {
    console.error('添加素材视频失败:', error);
    throw error;
  }
};

/**
 * 翻译文本
 * @param text 待翻译的文本
 * @returns 翻译结果
 */
export const translateText = async (text: string): Promise<{text: string}> => {
  try {
    const response = await axios.post<ApiResponse<{text: string}>>(
      '/ai/translate',
      {
        text,
        aiModel: 'qwen-turbo'
      },
      {
        baseURL: API_CONFIG.fullBaseURL,
        timeout: API_CONFIG.timeout,
        headers: API_HEADERS
      }
    );
    
    if (response.data.code === API_RESPONSE_CODE.SUCCESS) {
      return response.data.data;
    }
    throw new Error(response.data.message || '翻译失败');
  } catch (error) {
    console.error('翻译失败:', error);
    throw error;
  }
}; 