/**
 * 文案类型配置
 * 定义支持的文案类型和映射关系
 */

export interface TextTypeOption {
  value: string;
  label: string;
  type: string;
  subType?: string;
}

/**
 * 文案类型配置和映射关系
 * 支持type和subType的层级结构，便于扩展
 */
export const TEXT_TYPE_CONFIG: TextTypeOption[] = [
  { value: 'lifehacks_text', label: '生活小妙招', type: 'lifehacks_text' },
  { value: 'feeling_peace', label: '情感-温和', type: 'feeling', subType: 'peace' },
  { value: 'feeling_grudge', label: '情感-怨气', type: 'feeling', subType: 'grudge' },
  { value: 'feeling_famous', label: '名人名言', type: 'feeling', subType: 'famous' }
];

/**
 * 根据value获取对应的type和subType
 */
export const getTypeAndSubType = (value: string): { type: string; subType?: string } => {
  const config = TEXT_TYPE_CONFIG.find(item => item.value === value);
  if (!config) {
    return { type: value };
  }
  return {
    type: config.type,
    subType: config.subType
  };
};

/**
 * 根据type和subType获取对应的value
 */
export const getValueByTypeAndSubType = (type: string, subType?: string): string => {
  const config = TEXT_TYPE_CONFIG.find(item => 
    item.type === type && item.subType === subType
  );
  return config ? config.value : type;
};
