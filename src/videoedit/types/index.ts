/**
 * 视频剪辑相关类型定义
 */

/**
 * 视频信息接口
 */
export interface VideoInfo {
  resolution: string;
  file_size_bytes: number;
  file_duration: number;
  language: string;
  platform: string;
}

/**
 * 单词信息接口
 */
export interface WordInfo {
  start: number;
  end: number;
  word: string;
  probability: number;
}

/**
 * 视频片段信息接口
 */
export interface SegmentInfo {
  id: number;
  seek?: number;
  start: number;
  end: number;
  text: string;
  words: WordInfo[];
}

/**
 * 视频切片项接口
 */
export interface VideoClipItem {
  id: string;
  title?: string; // 切片标题
  text: string;
  startTime: number;
  endTime: number;
  isDefault?: boolean; // 是否为默认切片
}

/**
 * 解析任务详情接口
 */
export interface ParseTaskDetail {
  id: string;
  parse_url: string;
  status: string;
  file_urls?: string[];
  video_info?: VideoInfo;
  video_url?: string;
  preview_image?: string;
  text?: string;
  segments?: SegmentInfo[];
}

/**
 * 页面状态保存接口
 */
export interface VideoEditState {
  text: string; // 主文本框内容
  clips: VideoClipItem[]; // 切片内容
  mode: 'clip' | 'edit'; // 切片/编辑模式
  cursorPosition: number; // 光标位置
} 