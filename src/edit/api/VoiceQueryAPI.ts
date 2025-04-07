/**
 * 音色查询API服务
 * 负责处理音色查询相关的API请求
 */
import axios from 'axios';
import { API_CONFIG, API_PATHS, API_HEADERS } from '../../config/api';

/**
 * 创建axios实例
 */
const apiClient = axios.create({
  baseURL: API_CONFIG.fullBaseURL,
  timeout: API_CONFIG.timeout,
  headers: API_HEADERS
});

/**
 * 请求拦截器
 */
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证信息等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
apiClient.interceptors.response.use(
  (response) => {
    // 直接返回响应数据
    return response.data;
  },
  (error) => {
    // 统一处理错误
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

// 音色查询参数接口
export interface VoiceQueryParams {
  gender?: string;
  age?: string;
  tag?: string;
  fav?: boolean;
  hot?: boolean;
  pageSize?: number;
  pageIndex?: number;
  voice_server?: string;
}

// 音色示例语音接口
export interface SpeechInfo {
  text: string;
  url: string;
}

// 情感信息接口
export interface EmotionInfo {
  id: string;
  name: string;
  speech: SpeechInfo;
}

// 音色信息接口
export interface VoiceInfo {
  voiceCode: string;
  voicer: string;
  avatar: string;
  speech: SpeechInfo;
  isFav: boolean;
  supportVoiceParam: string[];
  emotion?: EmotionInfo[];
  settings?: {
    speed: number;
    pitch: number;
    intensity: number;
  };
}

// 顶部栏项目接口
export interface TopBarItem {
  type: string;
  text: string;
  filter?: {
    tag?: string;
    [key: string]: any;
  };
  id?: string;
}

// 分页信息接口
export interface PagesInfo {
  pageNum: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

// 查询响应接口
export interface VoiceQueryResponse {
  status: string;
  msg: string;
  data: {
    pages: PagesInfo;
    topbar: TopBarItem[];
    content: VoiceInfo[];
  };
}

/**
 * 音色查询API类
 */
export class VoiceQueryAPI {
  private static readonly CACHE_KEY = 'voice_query_cache';
  private static readonly CACHE_EXPIRY = 1000 * 60 * 60 * 24; // 24小时后缓存过期

  /**
   * 查询音色列表
   */
  static async queryVoices(params: VoiceQueryParams): Promise<VoiceQueryResponse> {
    try {
      return await apiClient.get(API_PATHS.voice.query, {
        params: {
          pageSize: params.pageSize || 100,
          pageIndex: params.pageIndex || 1,
          ...params
        }
      });
    } catch (error) {
      console.error('查询音色列表失败:', error);
      throw error;
    }
  }

  /**
   * 从本地缓存获取数据
   */
  static getFromCache(cacheKey: string): VoiceQueryResponse | null {
    try {
      const cacheData = localStorage.getItem(`${this.CACHE_KEY}_${cacheKey}`);
      if (!cacheData) return null;

      const { data, timestamp } = JSON.parse(cacheData);
      if (Date.now() - timestamp > this.CACHE_EXPIRY) {
        localStorage.removeItem(`${this.CACHE_KEY}_${cacheKey}`);
        return null;
      }

      return data;
    } catch (error) {
      console.error('读取缓存失败:', error);
      return null;
    }
  }

  /**
   * 保存数据到本地缓存
   */
  static saveToCache(cacheKey: string, data: VoiceQueryResponse): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(`${this.CACHE_KEY}_${cacheKey}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('保存缓存失败:', error);
    }
  }

  /**
   * 生成缓存键
   */
  static generateCacheKey(params: VoiceQueryParams): string {
    // 按字母顺序排序参数，确保相同参数生成相同的缓存键
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc: Record<string, any>, key) => {
        if (params[key as keyof VoiceQueryParams] !== undefined) {
          acc[key] = params[key as keyof VoiceQueryParams];
        }
        return acc;
      }, {});

    return `${this.CACHE_KEY}_${JSON.stringify(sortedParams)}`;
  }
} 