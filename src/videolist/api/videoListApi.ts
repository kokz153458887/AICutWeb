/**
 * 视频列表API服务
 * 负责处理视频列表页的所有接口请求
 */
import axios from 'axios';
import { API_CONFIG, API_PATHS, API_HEADERS, API_RESPONSE_CODE } from '../../config/api';

// 视频信息接口
export interface VideoItem {
  coverImg: string;
  videoUrl: string;
}

// 视频卡片数据接口
export interface VideoCardData {
  generateId: string;
  title: string;
  text: string;
  createTime: string;
  status: 'done' | 'generating' | 'failed';
  ratio: string;
  videoShowRatio: string;
  materialName: string;
  videolist: VideoItem[];
}

// 新版视频数据接口
export interface Video {
  id: string;
  title: string;
  content: string;
  createTime: number;
  status: 'generated' | 'generating' | 'failed';
  tags: string[];
  videos: VideoItem[];
}

/**
 * 分页参数接口
 */
export interface PaginationParams {
  pageNum: number;
  pageSize: number;
  filterCreateTime?: number; // 可选的时间过滤参数
}

// 视频列表响应接口
export interface VideoListResponse {
  code: number;
  message: string;
  data: {
    videolist: VideoCardData[];
    total?: number;
    hasMore?: boolean;
  };
}

// 重新生成视频响应接口
export interface RegenerateResponse {
  code: number;
  message: string;
  data: {
    regenerateId: string;
    status: string;
  };
}

/**
 * 获取视频列表数据
 * @param params 分页参数
 */
export const getVideoList = async (params?: PaginationParams): Promise<{
  videoList: VideoCardData[];
  hasMore: boolean;
}> => {
  try {
    const response = await axios.get<VideoListResponse>(API_PATHS.videoList.getList, {
      baseURL: API_CONFIG.fullBaseURL,
      params,
      timeout: API_CONFIG.timeout,
      headers: API_HEADERS
    });

    if (response.data.code === API_RESPONSE_CODE.SUCCESS && response.data.data && response.data.data.videolist) {
      return {
        videoList: response.data.data.videolist,
        hasMore: response.data.data.hasMore ?? false
      };
    }

    throw new Error(response.data.message || '获取视频列表失败');
  } catch (error) {
    console.error('获取视频列表出错:', error);
    throw error;
  }
};

/**
 * 获取单个视频详情
 * @param id 视频ID
 */
export const getVideoDetail = async (id: string): Promise<VideoCardData | null> => {
  try {
    interface DetailResponse {
      code: number;
      message: string;
      data: VideoCardData;
    }

    const response = await axios.get<DetailResponse>(API_PATHS.videoList.getDetail(id), {
      baseURL: API_CONFIG.fullBaseURL,
      timeout: API_CONFIG.timeout,
      headers: API_HEADERS
    });

    if (response.data.code === API_RESPONSE_CODE.SUCCESS && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('获取视频详情出错:', error);
    return null;
  }
};

/**
 * 重新生成视频
 * @param generateId 视频生成ID
 */
export const regenerateVideo = async (generateId: string): Promise<RegenerateResponse> => {
  try {
    const response = await axios.post<RegenerateResponse>(
      API_PATHS.videoList.regenerate,
      { generateId },
      {
        baseURL: API_CONFIG.fullBaseURL,
        timeout: API_CONFIG.timeout,
        headers: API_HEADERS
      }
    );

    if (response.data.code === API_RESPONSE_CODE.SUCCESS) {
      return response.data;
    }

    throw new Error(response.data.message || '重新生成视频失败');
  } catch (error) {
    console.error('重新生成视频出错:', error);
    throw error;
  }
}; 