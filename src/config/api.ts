/**
 * API配置文件
 * 统一管理所有接口的host和port配置
 */

// 环境变量配置
const ENV_CONFIG = {
  env: import.meta.env.VITE_NODE_ENV || 'development',
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  useMock: import.meta.env.VITE_API_MOCK === 'true'
};

// API基础配置
export const API_CONFIG = {
  // 基础URL
  baseURL: ENV_CONFIG.useMock ? '' : ENV_CONFIG.baseUrl,
  
  // API版本
  version: 'v1',
  
  // 接口超时时间（毫秒）
  timeout: 10000,
  
  // 是否使用mock数据
  useMock: ENV_CONFIG.useMock,
  
  // API路径前缀
  prefix: '/api',
  
  // 完整的基础URL（包含前缀）
  get fullBaseURL() {
    return `${this.baseURL}${this.prefix}`;
  }
};

// 导出常用的API路径
export const API_PATHS = {
  // 首页相关
  home: {
    getHomeData: '/home/getHomeData'
  },
  
  // 视频列表相关
  videoList: {
    getList: '/videolist',
    getDetail: (id: string) => `/videolist/${id}`,
    regenerate: '/videolist/regenerate'
  },
  
  // 视频编辑相关
  edit: {
    getConfig: '/edit/config',
    submit: '/edit/submit'
  },
  
  // 视频详情相关
  video: {
    getDetail: '/video/getVideoDetail'
  }
};

// 导出请求头配置
export const API_HEADERS = {
  'Content-Type': 'application/json',
  // 可以添加其他通用请求头
};

// 导出响应码配置
export const API_RESPONSE_CODE = {
  SUCCESS: 0,
  SUCCESS_ALT: 200, // 某些接口可能使用200作为成功码
  ERROR: 500,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404
}; 