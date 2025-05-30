/**
 * 视频切片状态枚举
 */
export enum VideoSliceStatus {
  PARSING = 'parsing',     // 解析中
  PARSE_FAILED = 'parse_failed', // 解析失败
  PENDING = 'pending',     // 待录入
  RECORDED = 'recorded',   // 已录入
  ABANDONED = 'abandoned'  // 已废弃
}

/**
 * 视频切片状态标签映射
 */
export const VideoSliceStatusLabels: Record<VideoSliceStatus, string> = {
  [VideoSliceStatus.PARSING]: '解析中',
  [VideoSliceStatus.PARSE_FAILED]: '解析失败',
  [VideoSliceStatus.PENDING]: '待录入',
  [VideoSliceStatus.RECORDED]: '已录入',
  [VideoSliceStatus.ABANDONED]: '已废弃'
};

/**
 * 视频切片筛选类型
 */
export enum VideoSliceFilter {
  ALL = 'all',           // 全部
  PENDING = 'pending',   // 待录入
  PARSE_FAILED = 'parse_failed', // 解析失败
  RECORDED = 'recorded'  // 已录入
}

/**
 * 视频切片筛选标签映射
 */
export const VideoSliceFilterLabels: Record<VideoSliceFilter, string> = {
  [VideoSliceFilter.ALL]: '全部',
  [VideoSliceFilter.PENDING]: '待录入',
  [VideoSliceFilter.PARSE_FAILED]: '解析失败',
  [VideoSliceFilter.RECORDED]: '已录入'
};

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
 * 视频切片数据项接口
 */
export interface VideoSliceItem {
  id: string;
  cover: string;        // 视频封面图URL
  text: string;         // 3行文本内容
  status: VideoSliceStatus; // 状态
  createTime: string;   // 创建时间
  updateTime: string;   // 更新时间
  // 扩展字段，用于存储解析相关的额外信息
  videoUrl?: string;    // 视频文件URL
  parseUrl?: string;    // 原始解析URL
  videoInfo?: VideoInfo; // 视频信息
}

/**
 * 视频切片列表响应接口
 */
export interface VideoSliceListResponse {
  items: VideoSliceItem[];
  hasMore: boolean;
  total: number;
} 