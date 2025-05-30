/**
 * 视频解析相关API接口
 * 负责视频解析和列表数据的获取
 */
import axios from 'axios';
import { API_CONFIG, API_HEADERS, API_RESPONSE_CODE } from '../../config/api';

// 视频信息接口
export interface VideoInfo {
  resolution: string;
  file_size_bytes: number;
  file_duration: number;
  language: string;
  platform: string;
}

// 解析任务状态枚举
export enum ParseTaskStatus {
  PARSING = 'parsing',
  PARSE_FAILED = 'parse_failed', 
  PENDING = 'pending',
  RECORDED = 'recorded',
  ABANDONED = 'abandoned'
}

// 解析任务接口
export interface ParseTask {
  id: string;
  parse_url: string;
  status: ParseTaskStatus;
  file_urls?: string[];
  video_url?: string;
  preview_image?: string;
  text?: string;
  video_info?: VideoInfo;
  createTime: string;
  updateAt: string;
}

// 解析列表响应接口
export interface ParseListResponse {
  result: ParseTask[];
  total: number;
  pageNum: string;
  pageSize: string;
  totalPages: number;
}

// API通用响应接口
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 解析请求参数
export interface ParseRequest {
  parse_url: string;
}

// 列表查询参数
export interface ListQueryParams {
  status?: string;
  page_size?: number;
  page_num?: number;
}

/**
 * 发起视频解析请求
 * @param parseUrl 需要解析的URL
 * @returns 解析结果
 */
export const parseVideo = async (parseUrl: string): Promise<{ parse_url: string }> => {
  try {
    const response = await axios.post<ApiResponse<{ parse_url: string }>>(
      '/video/parse',
      { parse_url: parseUrl },
      {
        baseURL: API_CONFIG.fullBaseURL,
        timeout: API_CONFIG.timeout,
        headers: API_HEADERS
      }
    );
    
    if (response.data.code === API_RESPONSE_CODE.SUCCESS) {
      return response.data.data;
    }
    throw new Error(response.data.message || '视频解析失败');
  } catch (error) {
    console.error('视频解析失败:', error);
    throw error;
  }
};

/**
 * 获取解析任务列表
 * @param params 查询参数
 * @returns 解析任务列表
 */
export const getParseList = async (params: ListQueryParams): Promise<ParseListResponse> => {
  try {
    const queryParams: Record<string, string> = {};
    
    if (params.status) {
      queryParams.status = params.status;
    }
    if (params.page_size) {
      queryParams.page_size = params.page_size.toString();
    }
    if (params.page_num) {
      queryParams.page_num = params.page_num.toString();
    }

    const response = await axios.get<ApiResponse<ParseListResponse>>(
      '/video/parse/list',
      {
        baseURL: API_CONFIG.fullBaseURL,
        params: queryParams,
        timeout: API_CONFIG.timeout,
        headers: API_HEADERS
      }
    );
    
    if (response.data.code === API_RESPONSE_CODE.SUCCESS) {
      return response.data.data;
    }
    throw new Error(response.data.message || '获取解析列表失败');
  } catch (error) {
    console.error('获取解析列表失败:', error);
    throw error;
  }
};

/**
 * 删除解析任务
 * @param taskId 任务ID
 * @returns 删除结果
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const response = await axios.post<ApiResponse<any>>(
      '/video/parse/deleteTask',
      { taskId },
      {
        baseURL: API_CONFIG.fullBaseURL,
        timeout: API_CONFIG.timeout,
        headers: API_HEADERS
      }
    );
    
    if (response.data.code === API_RESPONSE_CODE.SUCCESS) {
      return;
    }
    throw new Error(response.data.message || '删除任务失败');
  } catch (error) {
    console.error('删除任务失败:', error);
    throw error;
  }
};
