/**
 * 视频操作页的数据类型定义
 */

// 单个视频项的数据结构
export interface VideoItem {
  coverImg: string;
  videoUrl: string;
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