/**
 * Token管理工具类
 * 负责Token的存储、获取、验证和清除
 */
import { TokenInfo, UserInfo } from './types';

const TOKEN_STORAGE_KEY = 'user_token_info';

/**
 * Token管理器类
 * 提供Token的完整生命周期管理
 */
export class TokenManager {
  /**
   * 保存Token信息到本地存储
   * @param token JWT Token字符串
   * @param expiresIn 过期时间字符串（如"7d"）
   * @param user 用户信息
   */
  static saveToken(token: string, expiresIn: string, user: UserInfo): void {
    const tokenInfo: TokenInfo = {
      token,
      expiresIn,
      loginTime: Date.now(),
      user
    };
    
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenInfo));
      console.log('[TokenManager] Token保存成功');
    } catch (error) {
      console.error('[TokenManager] Token保存失败:', error);
    }
  }

  /**
   * 从本地存储获取Token信息
   * @returns Token信息或null
   */
  static getTokenInfo(): TokenInfo | null {
    try {
      const tokenInfoStr = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!tokenInfoStr) {
        return null;
      }
      
      const tokenInfo: TokenInfo = JSON.parse(tokenInfoStr);
      return tokenInfo;
    } catch (error) {
      console.error('[TokenManager] 获取Token信息失败:', error);
      // 清除损坏的数据
      this.clearToken();
      return null;
    }
  }

  /**
   * 获取当前有效的Token字符串
   * @returns Token字符串或null
   */
  static getToken(): string | null {
    const tokenInfo = this.getTokenInfo();
    if (!tokenInfo) {
      return null;
    }
    
    // 检查Token是否过期
    if (this.isTokenExpired(tokenInfo)) {
      console.log('[TokenManager] Token已过期，清除Token');
      this.clearToken();
      return null;
    }
    
    return tokenInfo.token;
  }

  /**
   * 检查Token是否已过期
   * @param tokenInfo Token信息
   * @returns 是否过期
   */
  static isTokenExpired(tokenInfo: TokenInfo): boolean {
    const { loginTime, expiresIn } = tokenInfo;
    const now = Date.now();
    
    // 解析过期时间（支持格式：7d, 24h, 60m, 3600s）
    const expireMs = this.parseExpiresIn(expiresIn);
    if (expireMs === 0) {
      // 无法解析过期时间，认为已过期
      return true;
    }
    
    return (now - loginTime) > expireMs;
  }

  /**
   * 解析过期时间字符串为毫秒数
   * @param expiresIn 过期时间字符串
   * @returns 毫秒数
   */
  private static parseExpiresIn(expiresIn: string): number {
    if (!expiresIn) return 0;
    
    const match = expiresIn.match(/^(\d+)([dhms])$/);
    if (!match) return 0;
    
    const [, num, unit] = match;
    const value = parseInt(num, 10);
    
    switch (unit) {
      case 'd': return value * 24 * 60 * 60 * 1000; // 天
      case 'h': return value * 60 * 60 * 1000;      // 小时
      case 'm': return value * 60 * 1000;           // 分钟
      case 's': return value * 1000;                // 秒
      default: return 0;
    }
  }

  /**
   * 清除Token信息
   */
  static clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      console.log('[TokenManager] Token已清除');
    } catch (error) {
      console.error('[TokenManager] 清除Token失败:', error);
    }
  }

  /**
   * 检查是否已登录
   * @returns 是否已登录
   */
  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * 获取当前用户信息
   * @returns 用户信息或null
   */
  static getCurrentUser(): UserInfo | null {
    const tokenInfo = this.getTokenInfo();
    if (!tokenInfo || this.isTokenExpired(tokenInfo)) {
      return null;
    }
    return tokenInfo.user;
  }
} 