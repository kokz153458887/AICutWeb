/**
 * 视频播放页API服务
 * 负责获取视频详情数据
 */
import axios from 'axios';

// 视频内容数据接口
export interface VideoContent {
  videoUrl: string;
  title?: string; // 可选的标题字段
  text: string;
  cover: string;
  stars: string;
  ratio: string;
  navUrl: string;
}

// 模板样式接口
export interface Template {
  styleId: string;
  styleName: string;
  styles: Record<string, any>;
}

// 页面数据接口
export interface VideoDetailData {
  template: Template;
  content: VideoContent;
}

// API响应接口
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 获取视频详情数据
 * @param id 视频ID
 * @returns 视频详情数据
 */
export const getVideoDetail = async (id: string): Promise<VideoDetailData> => {
  try {
    const response = await axios.get<ApiResponse<VideoDetailData>>(`/api/video/getVideoDetail?id=${id}`);
    if (response.data.code === 0) {
      return response.data.data;
    }
    throw new Error(response.data.message || '获取视频详情失败');
  } catch (error) {
    console.error('获取视频详情失败:', error);
    throw error;
  }
}; 