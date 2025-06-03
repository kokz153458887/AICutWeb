/**
 * 音色筛选参数存储
 * 使用静态变量保存筛选参数
 */

// 静态筛选参数
let filters: { gender?: string; age?: string } = {};

/**
 * 设置筛选参数
 */
export const setFilters = (newFilters: { gender?: string; age?: string }) => {
  filters = newFilters;
  console.log('设置筛选参数:', filters);
};

/**
 * 获取筛选参数
 */
export const getFilters = (): { gender?: string; age?: string } => {
  return { ...filters };
};

/**
 * 清除筛选参数
 */
export const clearFilters = () => {
  filters = {};
  console.log('清除筛选参数');
};

/**
 * 判断是否有激活的筛选条件
 */
export const hasActiveFilters = () => {
  return Object.values(filters).some(value => value !== undefined);
}; 