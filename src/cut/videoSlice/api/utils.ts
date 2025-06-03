/**
 * 视频解析相关工具函数
 * 提供URL提取和数据转换功能
 */
import { VideoSliceItem, VideoSliceStatus } from '../types';
import { ParseTask, ParseTaskStatus } from './index';

/**
 * 从文本中提取URL
 * @param text 包含URL的文本
 * @returns 提取到的URL数组
 */
export const extractUrlsFromText = (text: string): string[] => {
  // URL正则表达式，匹配http、https开头的URL
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches || [];
};

/**
 * 将ParseTask转换为VideoSliceItem
 * @param task 解析任务数据
 * @returns 视频切片项数据
 */
export const transformTaskToSliceItem = (task: ParseTask): VideoSliceItem => {
  // 根据状态决定显示的文本
  let displayText = '';
  if (task.text) {
    displayText = task.text;
  } else {
    displayText = task.parse_url;
  }

  // 直接使用 ParseTaskStatus，不再转换
  let status: VideoSliceStatus;
  switch (task.status) {
    case ParseTaskStatus.PARSING:
      status = VideoSliceStatus.PARSING;
      break;
    case ParseTaskStatus.PARSE_FAILED:
      status = VideoSliceStatus.PARSE_FAILED;
      break;
    case ParseTaskStatus.PENDING:
      status = VideoSliceStatus.PENDING;
      break;
    case ParseTaskStatus.PROCESSING:
      status = VideoSliceStatus.PROCESSING; // 处理中状态
      break;
    case ParseTaskStatus.PROCESS_FAILED:
      status = VideoSliceStatus.PARSE_FAILED; // 处理失败视为解析失败状态
      break;
    case ParseTaskStatus.RECORDED:
      status = VideoSliceStatus.RECORDED;
      break;
    case ParseTaskStatus.ABANDONED:
      status = VideoSliceStatus.ABANDONED;
      break;
    default:
      status = VideoSliceStatus.PENDING;
      break;
  }

  return {
    id: task.id,
    cover: task.preview_image || '', // 如果没有预览图，使用空字符串
    text: displayText,
    status: status,
    createTime: task.createTime,
    updateTime: task.updateAt,
    // 扩展字段，用于存储额外信息
    videoUrl: task.video_url,
    parseUrl: task.parse_url,
    videoInfo: task.video_info
  };
};

/**
 * 将筛选器类型转换为API状态参数
 * @param filter 筛选器类型
 * @returns API状态参数
 */
export const filterToStatus = (filter: string): string | undefined => {
  switch (filter) {
    case 'pending':
      return 'pending';
    case 'parse_failed':
      return 'parse_failed';
    case 'recorded':
      return 'recorded';
    case 'all':
    default:
      return undefined; // 全部筛选时不传status参数
  }
}; 