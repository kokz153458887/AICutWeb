/**
 * 素材库选择API服务
 * 负责处理素材库选择相关的API请求
 */
import axios from 'axios';
import { ApiResponse, MaterialListResponse, MusicLibItem, StyleListResponse, VideoStyleItem, ImageLibItem } from './types';
import { API_CONFIG, API_PATHS, API_HEADERS } from '../../config/api';

/**
 * 使用与service.ts同样的axios实例
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

/**
 * 编辑页选择器API服务
 * 负责处理编辑页各种选择器相关的API请求
 */
export class EditSelectAPI {
  /**
   * 获取素材库列表
   * @param page 页码，默认1
   * @param limit 每页记录数，默认20，设置为-1时返回所有记录
   * @returns 素材库列表响应
   */
  static async getMaterialList(page: number = 1, limit: number = -1): Promise<ApiResponse<MaterialListResponse>> {
    console.log(`[EditSelectAPI] 获取素材库列表: page=${page}, limit=${limit}`);
    
    return apiClient.get(API_PATHS.material.list, {
      params: {
        page,
        limit
      }
    });
  }

  /**
   * 删除素材库中的文件或目录
   * @param materialId 素材库ID
   * @param deleteFilePath 要删除的文件路径数组
   * @returns 删除结果
   */
  static async deleteMaterial(materialId: string, deleteFilePath: string[]): Promise<ApiResponse<{id: string}>> {
    console.log(`[EditSelectAPI] 删除素材: materialId=${materialId}, deleteFilePath=`, deleteFilePath);
    
    return apiClient.post(API_PATHS.material.delete, {
      id: materialId,
      deleteFilePath
    });
  }

  /**
   * 获取音乐列表
   * @param page 页码，默认1
   * @param limit 每页记录数，默认20，设置为-1时返回所有记录
   * @returns 音乐列表响应
   */
  static async getMusicList(page: number = 1, limit: number = -1): Promise<ApiResponse<{data: MusicLibItem[]}>> {
    console.log(`[EditSelectAPI] 获取音乐列表: page=${page}, limit=${limit}`);
    
    return apiClient.get(API_PATHS.music.list, {
      params: {
        page,
        limit
      }
    });
  }

  /**
   * 获取视频风格列表
   * @param page 页码，默认1
   * @param limit 每页记录数，默认20，设置为-1时返回所有记录
   * @returns 视频风格列表响应
   */
  static async getStyleList(page: number = 1, limit: number = -1): Promise<ApiResponse<VideoStyleItem[]>> {
    console.log(`[EditSelectAPI] 获取视频风格列表: page=${page}, limit=${limit}`);
    
    return apiClient.get(API_PATHS.videoStyle.list, {
      params: {
        page,
        limit
      }
    });
  }
  
  /**
   * 创建视频风格
   * @param styleData 风格数据对象
   * @returns 创建结果
   */
  static async createStyle(styleData: {
    styleName: string;
    ratio: string;
    resolution: string;
    videoShowRatio: {
      ratio: string;
      cut_style: string;
    };
    font: {
      voice_font_style: any;
      title_font_style: any;
    };
  }): Promise<ApiResponse<VideoStyleItem>> {
    console.log(`[EditSelectAPI] 创建视频风格: name=${styleData.styleName}`);
    
    return apiClient.post(API_PATHS.videoStyle.create, styleData);
  }
  
  /**
   * 更新视频风格
   * @param id 风格ID
   * @param styleData 风格数据对象
   * @returns 更新结果
   */
  static async updateStyle(id: string, styleData: {
    styleName: string;
    ratio: string;
    resolution: string;
    videoShowRatio: {
      ratio: string;
      cut_style: string;
    };
    font: {
      voice_font_style: any;
      title_font_style: any;
    };
  }): Promise<ApiResponse<VideoStyleItem>> {
    console.log(`[EditSelectAPI] 更新视频风格: id=${id}, name=${styleData.styleName}`);
    
    return apiClient.put(`${API_PATHS.videoStyle.base}/${id}`, styleData);
  }

  /**
   * 获取背景图片列表
   * @param params 查询参数
   * @returns 图片列表响应
   */
  static async getImageList(params?: {
    ratio?: string;
    resolutionWidth?: number;
    resolutionHeight?: number;
  }): Promise<ApiResponse<{images: ImageLibItem[]}>> {
    console.log(`[EditSelectAPI] 获取背景图片列表:`, params);
    
    return apiClient.get(API_PATHS.image.list, {
      params
    });
  }

  /**
   * 上传背景图片
   * @param file 图片文件
   * @returns 上传结果
   */
  static async uploadImage(file: File): Promise<ApiResponse<{image: ImageLibItem}>> {
    console.log(`[EditSelectAPI] 上传背景图片: name=${file.name}, size=${file.size}`);
    
    // 检查文件大小限制（10MB）
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('文件大小不能超过10MB');
    }

    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('只支持jpg、jpeg、png、gif、webp格式的图片');
    }

    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post(API_PATHS.image.upload, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
} 