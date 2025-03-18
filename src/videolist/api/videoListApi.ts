/**
 * 视频列表API服务
 * 负责处理视频列表页的所有接口请求
 */

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
    // 构建URL和查询参数
    const url = new URL('/api/videolist', window.location.origin);
    
    if (params) {
      url.searchParams.append('pageNum', params.pageNum.toString());
      url.searchParams.append('pageSize', params.pageSize.toString());
      
      if (params.filterCreateTime) {
        url.searchParams.append('filterCreateTime', params.filterCreateTime.toString());
      }
    }
    
    const response = await fetch(url.toString());
    const data: VideoListResponse = await response.json();
    
    if (data.code === 200 && data.data && data.data.videolist) {
      return {
        videoList: data.data.videolist,
        hasMore: data.data.hasMore ?? false
      };
    }
    
    console.error('获取视频列表失败:', data.message);
    return { videoList: [], hasMore: false };
  } catch (error) {
    console.error('获取视频列表出错:', error);
    return { videoList: [], hasMore: false };
  }
};

/**
 * 获取单个视频详情
 * @param id 视频ID
 */
export const getVideoDetail = async (id: string): Promise<VideoCardData | null> => {
  try {
    const response = await fetch(`/api/videolist/${id}`);
    const data = await response.json();
    
    if (data.code === 200 && data.data) {
      return data.data;
    }
    
    console.error('获取视频详情失败:', data.message);
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
export const regenerateVideo = async (generateId: string): Promise<RegenerateResponse | null> => {
  try {
    const response = await fetch('/api/videolist/regenerate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ generateId })
    });
    
    const data = await response.json();
    
    if (data.code === 200) {
      return data;
    }
    
    console.error('重新生成视频失败:', data.message);
    return null;
  } catch (error) {
    console.error('重新生成视频出错:', error);
    return null;
  }
}; 