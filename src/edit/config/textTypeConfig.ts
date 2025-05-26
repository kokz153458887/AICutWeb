/**
 * 文案类型配置
 * 定义支持的文案类型和映射关系
 */

export interface TextTypeOption {
  value: string;
  label: string;
}

/**
 * 文案类型配置和映射关系
 */
export const TEXT_TYPE_CONFIG: TextTypeOption[] = [
  { value: 'lifehacks_text', label: '生活小妙招' },
  { value: 'Feeling_peace', label: '情感-温和' },
  { value: 'Feeling_grudge', label: '情感-怨气' }
];

/**
 * 获取文案类型标签
 */
export const getTextTypeLabel = (value: string): string => {
  const type = TEXT_TYPE_CONFIG.find(t => t.value === value);
  return type ? type.label : '未知类型';
}; 