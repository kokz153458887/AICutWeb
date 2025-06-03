/**
 * 音频缓存管理工具类
 * 负责管理音频缓存的存储、读取和清理
 */

// 音频缓存接口
export interface AudioCache {
  url: string;
  text: string;
  voiceParams: {
    voice_code: string;
    voice_name?: string;
    voice_server?: string;
    speed?: number;
    pitch?: number;
    intensity?: number;
    volume?: number;
    emotion?: string;
    emotion_intensity?: number;
  };
  timestamp: number; // 缓存时间戳
}

/**
 * 音频缓存管理类
 * 使用 localStorage 存储音频缓存数据
 */
class AudioCacheManager {
  private static readonly CACHE_KEY_PREFIX = 'voice_preview_cache_';
  private static readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24小时过期

  /**
   * 获取缓存的音频
   * @param key 缓存键
   * @returns 缓存的音频数据或null
   */
  static getCache(key: string): AudioCache | null {
    try {
      const cacheJson = localStorage.getItem(this.CACHE_KEY_PREFIX + key);
      if (!cacheJson) return null;

      const cache = JSON.parse(cacheJson) as AudioCache;
      
      // 检查缓存是否过期
      if (Date.now() - cache.timestamp > this.CACHE_EXPIRY) {
        this.removeCache(key);
        return null;
      }

      return cache;
    } catch (error) {
      console.error('读取音频缓存失败:', error);
      return null;
    }
  }

  /**
   * 设置音频缓存
   * @param key 缓存键
   * @param cache 缓存数据
   */
  static setCache(key: string, cache: Omit<AudioCache, 'timestamp'>): void {
    try {
      const cacheWithTimestamp: AudioCache = {
        ...cache,
        timestamp: Date.now()
      };
      localStorage.setItem(
        this.CACHE_KEY_PREFIX + key,
        JSON.stringify(cacheWithTimestamp)
      );
    } catch (error) {
      console.error('保存音频缓存失败:', error);
    }
  }

  /**
   * 移除指定的缓存
   * @param key 缓存键
   */
  static removeCache(key: string): void {
    localStorage.removeItem(this.CACHE_KEY_PREFIX + key);
  }

  /**
   * 清理过期缓存
   */
  static cleanExpiredCache(): void {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.CACHE_KEY_PREFIX)) {
          const cacheKey = key.replace(this.CACHE_KEY_PREFIX, '');
          this.getCache(cacheKey); // getCache 方法会自动清理过期缓存
        }
      });
    } catch (error) {
      console.error('清理过期缓存失败:', error);
    }
  }
}

export default AudioCacheManager; 