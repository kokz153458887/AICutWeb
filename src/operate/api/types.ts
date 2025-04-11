/**
 * 视频操作页的数据类型定义
 */

// 单个视频项的数据结构
export interface VideoItem {
  coverImg: string;
  videoUrl: string;
  size?: string;
  duration?: string;
}

// 视频操作页的完整数据结构
export interface VideoOperateData {
  generateId: string;
  title: string;
  text: string;
  createTime: string;
  status: 'done' | 'generating' | 'failed';
  ratio: string;
  materialName: string;
  videolist: VideoItem[];
}

// 视频播放器的状态
export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  loading: boolean;
  error: string | null;
}

// 分享模版接口响应
export interface ShareTemplateResponse {
  code: number;
  message: string;
}

// 查询视频任务详情响应
export interface QueryVideoTaskResponse {
  code: number;
  message: string;
  data: {
    generateId: string;
    title: string;
    text: string;
    createTime: string;
    updateTime: string;
    status: string;
    statusDetail: {
      status: string;
      progress: number;
      current_step: string;
    };
    config: {
      style: {
        ratio: string;
        resolution: string;
        styleName: string;
        videoShowRatio: {
          ratio: string;
        }
      };
      material: {
        name: string;
        materialID: string;
        previewUrl: string;
      }
    };
    videolist: {
      coverImg: string;
      videoUrl: string;
      size: string;
      duration: string;
    }[];
  }
} 