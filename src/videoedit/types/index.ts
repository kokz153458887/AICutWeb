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
  title: string;
  text: string;
  startTime: number;
  endTime: number;
  isDefault?: boolean; // 是否为默认切片
  folder?: string; // 文件夹名称
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

/**
 * 素材库文件项信息
 */
export interface MaterialFileItem {
  name: string;
  type: 'file' | 'directory';
  size?: number;
  size_formatted?: string;
  duration?: number;
  duration_formatted?: string;
  width?: number;
  height?: number;
  codec?: string;
  absolute_path?: string;
  relative_path?: string;
  preview_image?: string;
  create_time?: string;
  children?: MaterialFileItem[];
}

/**
 * 素材库文件信息存储
 */
export interface MaterialFileStore {
  files: Record<string, MaterialFileItem>; // 所有文件的字典，key为文件名
  directories: string[]; // 所有文件夹名称
} 