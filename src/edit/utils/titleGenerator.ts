/**
 * 标题生成工具
 * 从文案中提取第一句话作为标题
 */
import { titleConfig } from '../config/titleConfig';

/**
 * 从文案中生成标题
 * @param text 完整文案
 * @returns 生成的标题
 */
export const generateTitle = (text: string): string => {
  if (!text) return '';

  // 查找第一个分隔符的位置
  let firstSentenceEnd = -1;
  for (const separator of titleConfig.separators) {
    const index = text.indexOf(separator);
    if (index !== -1 && (firstSentenceEnd === -1 || index < firstSentenceEnd)) {
      firstSentenceEnd = index;
    }
  }

  // 提取第一句话
  let firstSentence = '';
  if (firstSentenceEnd === -1) {
    // 如果没有找到分隔符，使用整个文本
    firstSentence = text;
  } else {
    // 提取到分隔符的位置（不包含分隔符）
    firstSentence = text.substring(0, firstSentenceEnd);
  }

  // 只有当第一句话超出最大长度时才截取
  if (firstSentence.length > titleConfig.maxLength) {
    return firstSentence.substring(0, titleConfig.maxLength) + titleConfig.ellipsis;
  }

  // 否则返回完整的第一句话
  return firstSentence;
}; 