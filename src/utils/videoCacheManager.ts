/**
 * 视频缓存管理器
 * 负责视频的缓存、存储和离线加载功能
 */

// 缓存状态枚举
export enum CacheStatus {
  NOT_CACHED = 'not_cached',      // 未缓存
  CACHING = 'caching',            // 缓存中
  CACHED = 'cached',              // 已缓存
  CACHE_FAILED = 'cache_failed'   // 缓存失败
}

// 缓存项接口
export interface CacheItem {
  originalUrl: string;            // 原始URL
  cachedUrl: string;             // 缓存的URL (Blob URL)
  size: number;                  // 文件大小
  createdAt: number;             // 创建时间戳
  accessedAt: number;            // 最后访问时间戳
  status: CacheStatus;           // 缓存状态
}

// 缓存配置接口
interface CacheConfig {
  maxSize: number;               // 最大缓存大小（字节）
  maxAge: number;                // 最大存活时间（毫秒）
}

/**
 * 视频缓存管理器类
 * 提供视频缓存的完整生命周期管理
 */
class VideoCacheManager {
  private cache: Map<string, CacheItem> = new Map();
  private config: CacheConfig;
  private cachePromises: Map<string, Promise<string>> = new Map(); // 正在进行的缓存Promise

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      maxSize: 500 * 1024 * 1024, // 默认500MB
      maxAge: 24 * 60 * 60 * 1000, // 默认24小时
      ...config
    };
    
    // 定期清理过期缓存
    this.startCleanupInterval();
  }

  /**
   * 获取缓存的视频URL
   * @param originalUrl 原始视频URL
   * @returns 缓存的URL或原始URL
   */
  getCachedUrl(originalUrl: string): string {
    const cacheItem = this.cache.get(originalUrl);
    
    if (cacheItem && cacheItem.status === CacheStatus.CACHED) {
      // 更新访问时间
      cacheItem.accessedAt = Date.now();
      return cacheItem.cachedUrl;
    }
    
    return originalUrl;
  }

  /**
   * 检查视频是否已缓存
   * @param originalUrl 原始视频URL
   * @returns 缓存状态
   */
  getCacheStatus(originalUrl: string): CacheStatus {
    const cacheItem = this.cache.get(originalUrl);
    return cacheItem?.status || CacheStatus.NOT_CACHED;
  }

  /**
   * 缓存视频
   * @param originalUrl 原始视频URL
   * @param onProgress 进度回调
   * @returns Promise<缓存的URL>
   */
  async cacheVideo(
    originalUrl: string, 
    onProgress?: (progress: number) => void
  ): Promise<string> {
    // 如果已经在缓存中，直接返回
    const existingItem = this.cache.get(originalUrl);
    if (existingItem && existingItem.status === CacheStatus.CACHED) {
      existingItem.accessedAt = Date.now();
      return existingItem.cachedUrl;
    }

    // 如果正在缓存，返回现有的Promise
    const existingPromise = this.cachePromises.get(originalUrl);
    if (existingPromise) {
      return existingPromise;
    }

    // 创建缓存Promise
    const cachePromise = this.performCache(originalUrl, onProgress);
    this.cachePromises.set(originalUrl, cachePromise);

    try {
      const result = await cachePromise;
      this.cachePromises.delete(originalUrl);
      return result;
    } catch (error) {
      this.cachePromises.delete(originalUrl);
      throw error;
    }
  }

  /**
   * 执行实际的缓存操作
   * @param originalUrl 原始视频URL
   * @param onProgress 进度回调
   * @returns Promise<缓存的URL>
   */
  private async performCache(
    originalUrl: string, 
    onProgress?: (progress: number) => void
  ): Promise<string> {
    // 创建缓存项
    const cacheItem: CacheItem = {
      originalUrl,
      cachedUrl: '',
      size: 0,
      createdAt: Date.now(),
      accessedAt: Date.now(),
      status: CacheStatus.CACHING
    };
    
    this.cache.set(originalUrl, cacheItem);

    try {
      // 使用fetch下载视频
      const response = await fetch(originalUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      const totalSize = contentLength ? parseInt(contentLength, 10) : 0;
      
      // 检查缓存空间
      if (totalSize > 0) {
        await this.ensureCacheSpace(totalSize);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const chunks: Uint8Array[] = [];
      let downloadedSize = 0;

      // 逐块读取数据
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        downloadedSize += value.length;
        
        // 更新进度
        if (totalSize > 0 && onProgress) {
          const progress = (downloadedSize / totalSize) * 100;
          onProgress(Math.min(progress, 100));
        }
      }

      // 合并所有chunks
      const videoData = new Uint8Array(downloadedSize);
      let offset = 0;
      for (const chunk of chunks) {
        videoData.set(chunk, offset);
        offset += chunk.length;
      }

      // 创建Blob和URL
      const blob = new Blob([videoData], { type: 'video/mp4' });
      const cachedUrl = URL.createObjectURL(blob);

      // 更新缓存项
      cacheItem.cachedUrl = cachedUrl;
      cacheItem.size = downloadedSize;
      cacheItem.status = CacheStatus.CACHED;

      console.log(`视频缓存完成: ${originalUrl} -> ${cachedUrl} (${this.formatSize(downloadedSize)})`);
      
      return cachedUrl;

    } catch (error) {
      console.error('视频缓存失败:', error);
      cacheItem.status = CacheStatus.CACHE_FAILED;
      throw new Error(`视频缓存失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 确保有足够的缓存空间
   * @param requiredSize 需要的空间大小
   */
  private async ensureCacheSpace(requiredSize: number): Promise<void> {
    const currentSize = this.getCurrentCacheSize();
    
    if (currentSize + requiredSize <= this.config.maxSize) {
      return; // 空间足够
    }

    // 按访问时间排序，删除最久未使用的缓存
    const sortedItems = Array.from(this.cache.entries())
      .filter(([, item]) => item.status === CacheStatus.CACHED)
      .sort(([, a], [, b]) => a.accessedAt - b.accessedAt);

    let freedSize = 0;
    for (const [url, item] of sortedItems) {
      this.removeCacheItem(url);
      freedSize += item.size;
      
      if (currentSize - freedSize + requiredSize <= this.config.maxSize) {
        break;
      }
    }
  }

  /**
   * 移除缓存项
   * @param originalUrl 原始URL
   */
  private removeCacheItem(originalUrl: string): void {
    const item = this.cache.get(originalUrl);
    if (item && item.cachedUrl) {
      URL.revokeObjectURL(item.cachedUrl);
    }
    this.cache.delete(originalUrl);
  }

  /**
   * 获取当前缓存大小
   * @returns 当前缓存大小（字节）
   */
  private getCurrentCacheSize(): number {
    return Array.from(this.cache.values())
      .filter(item => item.status === CacheStatus.CACHED)
      .reduce((total, item) => total + item.size, 0);
  }

  /**
   * 开始定期清理过期缓存
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 60 * 60 * 1000); // 每小时清理一次
  }

  /**
   * 清理过期缓存
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    const expiredUrls: string[] = [];

    for (const [url, item] of this.cache.entries()) {
      if (item.status === CacheStatus.CACHED && 
          now - item.createdAt > this.config.maxAge) {
        expiredUrls.push(url);
      }
    }

    expiredUrls.forEach(url => {
      this.removeCacheItem(url);
      console.log(`清理过期缓存: ${url}`);
    });
  }

  /**
   * 手动清理所有缓存
   */
  clearAll(): void {
    for (const [url] of this.cache.entries()) {
      this.removeCacheItem(url);
    }
    console.log('所有视频缓存已清理');
  }

  /**
   * 格式化文件大小
   * @param bytes 字节数
   * @returns 格式化的大小字符串
   */
  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * 获取缓存统计信息
   * @returns 缓存统计
   */
  getCacheStats(): {
    totalItems: number;
    cachedItems: number;
    totalSize: number;
    formattedSize: string;
  } {
    const totalItems = this.cache.size;
    const cachedItems = Array.from(this.cache.values())
      .filter(item => item.status === CacheStatus.CACHED).length;
    const totalSize = this.getCurrentCacheSize();

    return {
      totalItems,
      cachedItems,
      totalSize,
      formattedSize: this.formatSize(totalSize)
    };
  }
}

// 创建全局缓存管理器实例
export const videoCacheManager = new VideoCacheManager();

export default VideoCacheManager; 