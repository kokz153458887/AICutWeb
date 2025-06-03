/**
 * 文本处理工具类
 * 用于处理文本中的特殊字符和格式化
 */

/**
 * 移除文本中的特殊字符
 * 保留基本的中英文字符、数字和常用标点符号
 * @param text 需要处理的文本
 * @returns 处理后的文本
 */
export const removeSpecialChars = (text: string): string => {
  if (!text) return '';
  
  // 保留中文、英文字母、数字、空格和常用标点符号
  // 中文范围：\u4e00-\u9fa5
  // 常用标点：,.?!;:，。？！；：""''()（）【】[]《》<>
  return text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s,.?!;:，。？！；：""''()（）【】[\]《》<>]/g, '');
};

/**
 * 清洁标题文本
 * 移除特殊字符，并限制长度
 * @param title 标题文本
 * @param maxLength 最大长度（默认50个字符）
 * @returns 处理后的标题
 */
export const cleanTitle = (title: string, maxLength: number = 50): string => {
  if (!title) return '';
  
  // 先移除特殊字符
  const cleanedTitle = removeSpecialChars(title);
  
  // 限制长度
  return cleanedTitle.length > maxLength 
    ? cleanedTitle.substring(0, maxLength) 
    : cleanedTitle;
};

/**
 * 清洁内容文本
 * 移除特殊字符，并进行基本格式化
 * @param content 内容文本
 * @returns 处理后的内容
 */
export const cleanContent = (content: string): string => {
  if (!content) return '';
  
  // 移除特殊字符
  let cleanedContent = removeSpecialChars(content);
  
  // 可以在这里添加额外的格式化逻辑
  // 例如合并多个空格、去除多余的换行等
  cleanedContent = cleanedContent.replace(/\s+/g, ',').trim();
  
  return cleanedContent;
}; 