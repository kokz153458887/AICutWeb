/**
 * 语音服务API
 * 负责处理语音查询和语音生成相关的API请求
 */
import axios, { AxiosResponse } from 'axios';
import { API_CONFIG, API_PATHS, API_HEADERS } from '../../config/api';
import { ApiResponse } from '../../types/api';

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

// 语音生成参数接口
export interface VoiceGenerateParams {
  voice_server?: string;
  text: string;
  voice_name: string;
  voice_code?: string;
  speed?: number;
  volume?: number;
  pitch?: number;
  emotion?: string;
  emotion_intensity?: number;
}

// 语音生成响应接口
export interface VoiceGenerateResponse {
  audio_url: string;
  duration: number;
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
  voiceServer?: string;
  voiceName?: string;
  avatar: string;
  speech: SpeechInfo;
  isFav: boolean;
  supportVoiceParam: string[];
  emotion?: EmotionInfo[];
  settings?: {
    speed: number;
    pitch: number;
    intensity: number;
    volume?: number;
    emotion?: string;
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
  code: number;
  message: string;
  data: {
    pages: PagesInfo;
    topbar: TopBarItem[];
    content: VoiceInfo[];
  };
}

/**
 * 语音服务API类
 */
export class VoiceService {
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
      return {
        code: -1,
        message: error instanceof Error ? error.message : '查询音色列表失败',
        data: {
          pages: {
            hasMore: false,
            pageNum: 1,
            pageSize: params.pageSize || 100,
            total: 0
          },
          topbar: [],
          content: []
        }
      };
    }
  }

  /**
   * 生成语音
   * @param params 语音生成参数
   * @returns 生成的语音URL和时长
   */
  static async generateVoice(params: VoiceGenerateParams): Promise<VoiceGenerateResponse> {
    try {
      console.log('生成语音，参数:', params);
      
      // 参数验证
      if (!params.text) {
        throw new Error('文本内容不能为空');
      }
      
      if (!params.voice_code && !params.voice_name) {
        throw new Error('音色名称或音色代码不能为空');
      }

      // 参数范围验证和转换
      const normalizedParams = {
        ...params,
        speed: params.speed !== undefined ? Math.max(-10, Math.min(10, params.speed)) : 1.0,
        volume: params.volume !== undefined ? Math.max(-10, Math.min(10, params.volume)) : 1.0,
        pitch: params.pitch !== undefined ? Math.max(-10, Math.min(10, params.pitch)) : 0.0,
        emotion_intensity: params.emotion_intensity !== undefined ? 
          Math.max(-10, Math.min(10, params.emotion_intensity)) : 0.0
      };

      const response: ApiResponse<VoiceGenerateResponse> = await apiClient.post('/voice/generate', normalizedParams);
      
      if (response.code === 0 && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '生成语音失败');
      }
    } catch (error) {
      console.error('生成语音失败:', error);
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