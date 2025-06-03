/**
 * API响应基础接口
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  data: T[];
} 