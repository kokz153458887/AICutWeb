import { HomeData } from './homeApiModel';
import { HomeApiService } from './homeApi';

/**
 * 首页数据管理器类
 * 负责获取、缓存和管理首页数据的所有逻辑
 */
export class HomeDataManager {
  // 数据缓存，存储已获取的数据，使用Map以支持更好的缓存管理
  private static dataCache: Map<string, HomeData> = new Map();
  
  // 进行中的请求记录
  private static pendingRequests: Map<string, Promise<{data: HomeData}>> = new Map();
  
  // 全局请求计数器
  private static globalRequestCount: number = 0;
  
  // 组件是否已挂载的引用
  private isMountedRef: React.MutableRefObject<boolean>;
  
  // 当前加载的tab ID的引用
  private currentTabIdRef: React.MutableRefObject<string | null>;
  
  // 本地请求ID，用于防止竞态条件
  private requestIdRef: React.MutableRefObject<number>;
  
  // 状态更新函数
  private setHomeData: (data: HomeData | null) => void;
  private setLoading: (loading: boolean) => void;
  private setError: (error: string | null) => void;
  
  // 分页相关状态更新函数
  private setHasMore: (hasMore: boolean) => void;
  private setIsLoadingMore: (isLoadingMore: boolean) => void;
  private setLoadMoreError: (loadMoreError: boolean) => void;
  
  /**
   * 构造函数
   * @param setters 状态更新函数集合
   * @param refs 引用集合
   */
  constructor(
    setters: {
      setHomeData: (data: HomeData | null) => void;
      setLoading: (loading: boolean) => void;
      setError: (error: string | null) => void;
      setHasMore: (hasMore: boolean) => void;
      setIsLoadingMore: (isLoadingMore: boolean) => void;
      setLoadMoreError: (loadMoreError: boolean) => void;
    },
    refs: {
      isMountedRef: React.MutableRefObject<boolean>;
      currentTabIdRef: React.MutableRefObject<string | null>;
      requestIdRef: React.MutableRefObject<number>;
    },
  ) {
    this.setHomeData = setters.setHomeData;
    this.setLoading = setters.setLoading;
    this.setError = setters.setError;
    this.setHasMore = setters.setHasMore;
    this.setIsLoadingMore = setters.setIsLoadingMore;
    this.setLoadMoreError = setters.setLoadMoreError;
    
    this.isMountedRef = refs.isMountedRef;
    this.currentTabIdRef = refs.currentTabIdRef;
    this.requestIdRef = refs.requestIdRef;
  }
  
  /**
   * 获取首页数据
   * @param tabId 标签ID
   * @param isLoadMore 是否加载更多
   * @param pageNum 页码
   */
  public async fetchHomeData(tabId: string, isLoadMore: boolean = false, pageNum: number = 1): Promise<void> {
    try {
      // 增加本地请求ID，用于防止竞态条件
      this.requestIdRef.current++;
      const currentRequestId = this.requestIdRef.current;
      
      // 如果不是加载更多，则设置加载状态
      if (!isLoadMore) {
        this.setLoading(true);
        this.setError(null);
      } else {
        this.setIsLoadingMore(true);
        this.setLoadMoreError(false);
      }
      
      // 创建缓存键
      const cacheKey = this.createCacheKey(tabId, pageNum);
      
      console.log(`[HomeDataManager] 开始请求数据: ${tabId}, 页码: ${pageNum}, 是否加载更多: ${isLoadMore}, 请求ID: ${currentRequestId}`);
      
      // 发送请求并获取数据
      const { data } = await this.sendRequest(tabId, isLoadMore, pageNum);
      
      // 检查组件是否已卸载或请求是否已过期
      if (!this.isMountedRef.current || this.requestIdRef.current !== currentRequestId) {
        console.log(`[HomeDataManager] 请求已过期或组件已卸载: ${tabId}, 请求ID: ${currentRequestId}, 当前ID: ${this.requestIdRef.current}`);
        return;
      }
      
      // 更新hasMore状态
      const hasMore = data.pages?.hasMore || false;
      console.log(`[HomeDataManager] 更新hasMore状态: ${hasMore}, 当前页码: ${pageNum}, 总数据: ${data.pages?.total || 0}`);
      this.setHasMore(hasMore);
      
      // 更新状态
      if (isLoadMore) {
        // 合并数据
        const existingData = HomeDataManager.dataCache.get(this.createCacheKey(tabId, pageNum - 1));
        if (existingData) {
          // 合并内容
          const mergedContent = [...existingData.content, ...data.content];
          const mergedData = {
            ...data,
            content: mergedContent,
            pages: data.pages ? {
              ...data.pages,
              pageNum: pageNum
            } : undefined
          };
          
          // 更新缓存
          HomeDataManager.dataCache.set(cacheKey, mergedData);
          
          // 更新状态
          this.setHomeData(mergedData);
          
          console.log(`[HomeDataManager] 合并数据 - 缓存数据: ${existingData.content.length}项, 新数据: ${data.content.length}项, hasMore: ${hasMore}`);
          console.log(`[HomeDataManager] 缓存数据第一项ID: ${existingData.content[0]?.styleId || 'N/A'}, 最后一项ID: ${existingData.content[existingData.content.length - 1]?.styleId || 'N/A'}`);
          console.log(`[HomeDataManager] 新数据第一项ID: ${data.content[0]?.styleId || 'N/A'}, 最后一项ID: ${data.content[data.content.length - 1]?.styleId || 'N/A'}`);
          console.log(`[HomeDataManager] 合并后数据总量: ${mergedContent.length}项`);
          console.log(`[HomeDataManager] 合并后第一项ID: ${mergedContent[0]?.styleId || 'N/A'}, 最后一项ID: ${mergedContent[mergedContent.length - 1]?.styleId || 'N/A'}`);
        } else {
          // 没有找到上一页数据，直接使用新数据
          HomeDataManager.dataCache.set(cacheKey, data);
          this.setHomeData(data);
          console.log(`[HomeDataManager] 未找到上一页缓存数据，直接使用新数据: ${data.content.length}项, hasMore: ${hasMore}`);
        }
      } else {
        // 直接使用新数据
        HomeDataManager.dataCache.set(cacheKey, data);
        this.setHomeData(data);
        console.log(`[HomeDataManager] 使用新数据: ${data.content.length}项, hasMore: ${hasMore}`);
      }
    } catch (error) {
      // 检查组件是否已卸载
      if (!this.isMountedRef.current) return;
      
      console.error(`[HomeDataManager] 获取数据失败: ${tabId}`, error);
      
      if (isLoadMore) {
        this.setLoadMoreError(true);
      } else {
        this.setError(error instanceof Error ? error.message : '获取数据失败');
      }
    } finally {
      // 检查组件是否已卸载
      if (!this.isMountedRef.current) return;
      
      // 如果不是加载更多，则设置加载状态为false
      if (!isLoadMore) {
        this.setLoading(false);
      } else {
        this.setIsLoadingMore(false);
      }
    }
  }
  
  /**
   * 创建缓存键
   * @param tabId 标签ID
   * @param pageNum 页码
   * @returns 缓存键
   */
  private createCacheKey(tabId: string, pageNum: number = 1): string {
    return `${tabId}_page${pageNum}`;
  }
  
  /**
   * 发送请求
   * @param tabId 标签ID
   * @param isLoadMore 是否加载更多
   * @param pageNum 页码
   * @returns 请求结果
   */
  private async sendRequest(tabId: string, isLoadMore: boolean = false, pageNum: number = 1): Promise<{data: HomeData}> {
    // 创建缓存键
    const cacheKey = this.createCacheKey(tabId, pageNum);
    
    // 检查缓存
    const cachedData = HomeDataManager.dataCache.get(cacheKey);
    if (cachedData && !isLoadMore) {
      console.log(`[HomeDataManager] 使用缓存数据: ${cacheKey}, 数据项数量: ${cachedData.content.length}, hasMore: ${cachedData.pages?.hasMore || false}`);
      return { data: cachedData };
    }
    
    // 检查是否有进行中的请求
    const pendingRequest = HomeDataManager.pendingRequests.get(cacheKey);
    if (pendingRequest) {
      console.log(`[HomeDataManager] 复用进行中的请求: ${cacheKey}`);
      return pendingRequest;
    }
    
    // 发送新请求
    console.log(`[HomeDataManager] 开始加载新数据: ${tabId}, 页码: ${pageNum}, 全局请求计数: ${++HomeDataManager.globalRequestCount}`);
    
    // 创建新请求
    const newRequest = HomeApiService.getHomeData(tabId, { pageNum, pageSize: 10 })
      .then(result => {
        console.log(`[HomeDataManager] 请求成功: ${tabId}, 页码: ${pageNum}, 数据项数量: ${result.data.content.length}, hasMore: ${result.data.pages?.hasMore || false}`);
        return result;
      });
    
    // 记录进行中的请求
    HomeDataManager.pendingRequests.set(cacheKey, newRequest);
    
    try {
      // 等待请求完成
      const result = await newRequest;
      
      // 移除进行中的请求记录
      HomeDataManager.pendingRequests.delete(cacheKey);
      
      return result;
    } catch (error) {
      // 移除进行中的请求记录
      HomeDataManager.pendingRequests.delete(cacheKey);
      
      console.error(`[HomeDataManager] 请求失败: ${tabId}, 页码: ${pageNum}`, error);
      
      // 抛出错误
      throw error;
    }
  }

  /**
   * 清理资源
   */
  public cleanup(): void {
    // 清理资源
    this.currentTabIdRef.current = null;
  }
}
