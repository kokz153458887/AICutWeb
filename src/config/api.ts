/**
 * API配置文件
 * 统一管理所有接口的host和port配置
 */

// 获取API基础URL
export const getApiBaseUrl = () => {
  const configuredHost = import.meta.env.VITE_API_HOST;
  const apiPort = import.meta.env.VITE_API_PORT || '5127';

  // 如果配置了域名，优先使用配置的域名
  if (configuredHost) {
    return `${configuredHost}:${apiPort}`;
  }

  // 否则使用当前域名
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:${apiPort}`;
  }

  // 降级方案：使用 localhost
  return `http://localhost:${apiPort}`;
};

// 环境变量配置
const ENV_CONFIG = {
  env: import.meta.env.VITE_NODE_ENV || 'development',
  baseUrl: getApiBaseUrl(),
  useMock: import.meta.env.VITE_API_MOCK === 'true'
};

// API基础配置
export const API_CONFIG = {
  // 基础URL
  baseURL: ENV_CONFIG.useMock ? '' : ENV_CONFIG.baseUrl,
  
  // API版本
  version: 'v1',
  
  // 接口超时时间（毫秒）
  timeout: 240 * 1000,
  
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
  // 用户相关
  user: {
    login: '/user/login'
  },
  
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
    createConfig: '/edit/create',
    generate: '/ai/generate',
    updateConfig: '/edit/update',
    autoGenerateText: '/ai/auto_generate_text',
    unlikeText: '/ai/unlike_auto_generate_text'
  },
  
  // 视频详情相关
  video: {
    getDetail: '/video/getVideoDetail'
  },
  
  // 素材库相关
  material: {
    list: '/material/list',
    delete: '/material/delete_video'
  },

  // 音乐库相关
  music: {
    list: '/music/list'
  },
  
  // 视频风格相关
  videoStyle: {
    list: '/videostyle/list',
    base: '/videostyle',
    create: '/videostyle/create'
  },

  // 图片相关
  image: {
    list: '/image/list',
    upload: '/image/upload'
  },
  
  // 音频合成相关
  audio: {
    synthesize: '/audio/synthesize',
    getVoices: '/audio/voices'
  },

  // 语音相关
  voice: {
    query: '/voice/query'
  }
};

/**
 * 获取API请求头，包含认证信息
 * @returns 请求头对象
 */
export const getApiHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  };

  // 添加Token到请求头
  if (typeof window !== 'undefined') {
    try {
      const tokenInfo = localStorage.getItem('user_token_info');
      if (tokenInfo) {
        const { token, loginTime, expiresIn } = JSON.parse(tokenInfo);
        
        // 简单的过期检查
        const now = Date.now();
        const parseExpiresIn = (expires: string): number => {
          const match = expires.match(/^(\d+)([dhms])$/);
          if (!match) return 0;
          const [, num, unit] = match;
          const value = parseInt(num, 10);
          switch (unit) {
            case 'd': return value * 24 * 60 * 60 * 1000;
            case 'h': return value * 60 * 60 * 1000;
            case 'm': return value * 60 * 1000;
            case 's': return value * 1000;
            default: return 0;
          }
        };
        
        const expireMs = parseExpiresIn(expiresIn);
        if (expireMs > 0 && (now - loginTime) <= expireMs) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('[API] 获取Token失败:', error);
    }
  }

  return headers;
};

// 导出请求头配置（保持向后兼容）
export const API_HEADERS = getApiHeaders();

// 导出响应码配置
export const API_RESPONSE_CODE = {
  SUCCESS: 0,
  ERROR: 500,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404
}; 