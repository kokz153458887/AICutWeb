/**
 * 视频剪辑相关工具函数
 */
import { SegmentInfo, WordInfo, VideoEditState } from '../types';

/**
 * 将秒数转换为时间格式字符串（mm:ss.S）
 * @param seconds 秒数
 * @returns 格式化的时间字符串
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const mins = minutes.toString().padStart(2, '0');
  const secs = Math.floor(remainingSeconds).toString().padStart(2, '0');
  const decimal = Math.floor((remainingSeconds % 1) * 10); // 只保留一位小数
  return `${mins}:${secs}.${decimal}`;
};

/**
 * 将时间字符串解析为秒数
 * @param timeString 时间字符串 (支持多种格式: mm:ss.S, mm:ss.SS, mm:ss.SSS, mm:s.S 等)
 * @returns 秒数
 * @throws Error 当时间格式无效时抛出错误
 */
export const parseTime = (timeString: string): number => {
  // 支持更灵活的时间格式，主要支持一位小数
  const regex = /^(\d{1,2}):(\d{1,2})(?:\.(\d{0,3}))?$/;
  const match = timeString.match(regex);
  
  if (!match) {
    throw new Error(`Invalid time format: ${timeString}`);
  }
  
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  
  // 处理小数部分，优先支持一位小数
  let milliseconds = 0;
  if (match[3]) {
    if (match[3].length === 1) {
      // 一位小数: 0.1 -> 100ms
      milliseconds = parseInt(match[3], 10) * 100;
    } else if (match[3].length === 2) {
      // 两位小数: 0.12 -> 120ms
      milliseconds = parseInt(match[3], 10) * 10;
    } else {
      // 三位小数: 0.123 -> 123ms
      milliseconds = parseInt(match[3], 10);
    }
  } else {
    milliseconds = 0
  }
  
  // 验证范围
  if (seconds >= 60) {
    throw new Error(`Invalid seconds: ${seconds}. Seconds must be less than 60.`);
  }
  
  return minutes * 60 + seconds + milliseconds / 1000;
};

/**
 * 构建全文本到词语映射的索引
 * @param segments 语音识别的片段数据
 * @returns 字符索引到词语的映射数组
 */
export const buildTextToWordsIndex = (segments: SegmentInfo[]) => {
  const indexMap: Array<{
    char: string;
    charIndex: number;
    word: WordInfo;
    segmentIndex: number;
    wordIndex: number;
  }> = [];
  
  let globalCharIndex = 0;
  
  segments.forEach((segment, segmentIndex) => {
    segment.words.forEach((word, wordIndex) => {
      // 为每个字符建立索引
      for (let i = 0; i < word.word.length; i++) {
        indexMap.push({
          char: word.word[i],
          charIndex: globalCharIndex + i,
          word: word,
          segmentIndex,
          wordIndex
        });
      }
      globalCharIndex += word.word.length;
    });
  });
  
  return indexMap;
};

/**
 * 精确根据文本和光标位置，从segments中找到对应的时间范围
 * @param fullText 完整的原始文本
 * @param clipText 要切片的文本内容
 * @param clipStartInFullText 切片文本在完整文本中的起始位置
 * @param segments 语音识别的片段数据
 * @returns 时间范围 { startTime, endTime }
 */
export const findPreciseTimeRangeByText = (
  fullText: string,
  clipText: string,
  clipStartInFullText: number,
  segments: SegmentInfo[]
): { startTime: number; endTime: number } => {
  // 构建字符到词语的精确映射
  const indexMap = buildTextToWordsIndex(segments);
  
  // 计算切片在全文中的范围
  const clipStartIndex = clipStartInFullText;
  const clipEndIndex = clipStartInFullText + clipText.length - 1;
  
  // 找到对应的起始和结束词语
  let startWord: WordInfo | null = null;
  let endWord: WordInfo | null = null;
  
  // 找起始词语
  for (const item of indexMap) {
    if (item.charIndex === clipStartIndex) {
      startWord = item.word;
      break;
    }
  }
  
  // 找结束词语
  for (const item of indexMap) {
    if (item.charIndex === clipEndIndex) {
      endWord = item.word;
      break;
    }
  }
  
  // 如果找不到精确匹配，使用范围查找
  if (!startWord) {
    for (const item of indexMap) {
      if (item.charIndex <= clipStartIndex) {
        startWord = item.word;
      } else {
        break;
      }
    }
  }
  
  if (!endWord) {
    for (const item of indexMap) {
      if (item.charIndex <= clipEndIndex) {
        endWord = item.word;
      } else {
        break;
      }
    }
  }
  
  // 返回时间范围
  const startTime = startWord ? startWord.start : 0;
  const endTime = endWord ? endWord.end : (segments[segments.length - 1]?.words[segments[segments.length - 1]?.words.length - 1]?.end || 0);
  
  return { startTime, endTime };
};

/**
 * 根据文本和光标位置，从segments中找到对应的时间范围（兼容旧版本）
 * @param text 完整文本
 * @param cursorPosition 光标位置
 * @param segments 语音识别的片段数据
 * @returns 时间范围 { startTime, endTime }
 */
export const findTimeRangeByText = (
  text: string, 
  cursorPosition: number, 
  segments: SegmentInfo[]
): { startTime: number; endTime: number } => {
  // 获取从开头到光标位置的文本
  const textBeforeCursor = text.substring(0, cursorPosition);
  
  // 使用新的精确算法
  return findPreciseTimeRangeByText(
    text, // 假设这是完整文本
    textBeforeCursor,
    0, // 从头开始
    segments
  );
};

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 保存视频编辑状态到本地存储
 * @param taskId 任务ID
 * @param state 编辑状态
 */
export const saveVideoEditState = (taskId: string, state: VideoEditState): void => {
  try {
    const key = `video_edit_state_${taskId}`;
    localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error('保存视频编辑状态失败:', error);
  }
};

/**
 * 从本地存储加载视频编辑状态
 * @param taskId 任务ID
 * @returns 编辑状态或null
 */
export const loadVideoEditState = (taskId: string): VideoEditState | null => {
  try {
    const key = `video_edit_state_${taskId}`;
    const savedState = localStorage.getItem(key);
    return savedState ? JSON.parse(savedState) : null;
  } catch (error) {
    console.error('加载视频编辑状态失败:', error);
    return null;
  }
}; 