/**
 * 登录API服务
 * 负责处理用户登录相关的API请求
 */
import axios from 'axios';
import { API_CONFIG, API_PATHS, API_RESPONSE_CODE } from '../../config/api';
import { LoginRequest, LoginApiResponse } from '../types';

/**
 * 登录API服务类
 * 处理用户认证相关的接口请求
 */
export class LoginApiService {
  /**
   * 用户登录
   * @param loginData 登录请求数据
   * @returns 登录响应数据
   */
  static async login(loginData: LoginRequest): Promise<LoginApiResponse> {
    try {
      console.log('[LoginApi] 发起登录请求:', { username: loginData.username });
      
      const response = await axios.post<LoginApiResponse>(
        API_PATHS.user.login,
        loginData,
        {
          baseURL: API_CONFIG.fullBaseURL,
          timeout: API_CONFIG.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.code === API_RESPONSE_CODE.SUCCESS) {
        console.log('[LoginApi] 登录成功:', response.data.data.user.username);
        return response.data;
      }
      
      throw new Error(response.data.message || '登录失败');
    } catch (error) {
      console.error('[LoginApi] 登录失败:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // 服务器返回了错误响应
          const errorMessage = error.response.data?.message || '登录失败，请检查用户名和密码';
          throw new Error(errorMessage);
        } else if (error.request) {
          // 请求已发送但没有收到响应
          throw new Error('网络连接失败，请检查网络状态');
        } else {
          // 请求配置出错
          throw new Error('请求配置错误');
        }
      }
      
      throw error;
    }
  }
} 