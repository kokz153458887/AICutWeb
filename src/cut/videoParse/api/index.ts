/**
 * 视频解析结果相关API接口
 * 负责获取视频解析结果详情数据
 */
import axios from 'axios';
import { API_CONFIG, API_HEADERS, API_RESPONSE_CODE } from '../../../config/api';

// 视频信息接口
export interface VideoInfo {
  resolution: string;
  file_size_bytes: number;
  file_duration: number;
  language: string;
  platform: string;
}

// 视频片段接口
export interface VideoClip {
  name: string;
  folder: string;
  beginTime: string;
  endTime: string;
  text: string;
  clipFilePath: string;
  preview_image: string;
  video_path: string;
}

// 解析结果详情接口
export interface ParseResultDetail {
  _id: string;
  id: string;
  parse_url: string;
  status: string;
  file_urls: string[];
  video_url: string;
  preview_image: string;
  text: string;
  output_url: string;
  segments: string;
  createTime: string;
  updateAt: string;
  updateTime: string;
  video_info: VideoInfo;
  clips: VideoClip[];
  materialCoverUrl: string;
  materialId: string;
  materialName: string;
  materialPreviewUrl: string;
  materialUrl: string;
  video_subtype: string;
  video_type: string;
}

// API通用响应接口
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 查询视频解析结果详情
 * @param id 解析任务ID
 * @returns 解析结果详情
 */
export const getParseResultDetail = async (id: string): Promise<ParseResultDetail> => {
  try {
    const response = await axios.get<ApiResponse<ParseResultDetail>>(
      '/video/parse/query',
      {
        baseURL: API_CONFIG.fullBaseURL,
        params: { id },
        timeout: API_CONFIG.timeout,
        headers: API_HEADERS
      }
    );
    
    if (response.data.code === API_RESPONSE_CODE.SUCCESS) {
      return response.data.data;
    }
    throw new Error(response.data.message || '获取解析结果失败');
  } catch (error) {
    console.error('获取解析结果失败:', error);
    throw error;
  }
}; 