/**
 * 视频风格选择弹窗组件
 * 负责展示视频风格列表，支持选择功能
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../../styles/StyleSelectModal.css';
import '../../styles/MeterialCommon.css';
import StyleItem from './StyleItem';
import { VideoStyleItem, StyleModel, StyleListResponse } from '../../api/types';
import { EditSelectAPI } from '../../api/EditSelectAPI';
import { ApiResponse } from '../../../types/api';

// 缓存过期时间：5分钟
const CACHE_EXPIRY_TIME = 1000 * 60 * 5;

interface StyleSelectModalProps {
  onClose: () => void;
  onSelect: (style: StyleModel) => void;
  currentStyleId?: string;
}

interface CacheData {
  data: VideoStyleItem[];
  timestamp: number;
}

/**
 * 视频风格选择弹窗组件
 */
const StyleSelectModal: React.FC<StyleSelectModalProps> = ({
  onClose,
  onSelect,
  currentStyleId
}) => {
  // 视频风格列表数据
  const [styleList, setStyleList] = useState<VideoStyleItem[]>([]);
  // 加载状态
  const [loading, setLoading] = useState<boolean>(false);
  // 数据刷新状态
  const [refreshing, setRefreshing] = useState<boolean>(false);
  // 错误信息
  const [error, setError] = useState<string>('');
  // 用于跟踪组件是否已卸载
  const mountedRef = useRef(true);
  // 用于取消重试的定时器
  const retryTimerRef = useRef<number>();

  /**
   * 从本地存储获取缓存数据
   */
  const getLocalData = useCallback((): CacheData | null => {
    try {
      const cached = localStorage.getItem('style_list_cache');
      if (!cached) return null;
      
      const parsedCache = JSON.parse(cached) as CacheData;
      if (Date.now() - parsedCache.timestamp > CACHE_EXPIRY_TIME) {
        localStorage.removeItem('style_list_cache');
        return null;
      }
      
      return parsedCache;
    } catch (err) {
      console.error('读取缓存数据失败:', err);
      localStorage.removeItem('style_list_cache');
      return null;
    }
  }, []);

  /**
   * 更新本地存储缓存
   */
  const updateLocalCache = useCallback((data: VideoStyleItem[]) => {
    try {
      const cacheData: CacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem('style_list_cache', JSON.stringify(cacheData));
    } catch (err) {
      console.error('更新缓存数据失败:', err);
    }
  }, []);

  /**
   * 加载视频风格列表数据
   */
  const loadStyleList = useCallback(async () => {
    // 如果组件已卸载，不执行加载
    if (!mountedRef.current) return;

    try {
      setError('');
      const cached = getLocalData();
      
      if (cached?.data && cached.data.length > 0) {
        setStyleList(cached.data);
        setLoading(false);
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // 添加超时处理
      const response = await Promise.race([
        EditSelectAPI.getStyleList(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('请求超时')), 10000)
        )
      ]) as ApiResponse<VideoStyleItem[]>;
      
      // 如果组件已卸载，不更新状态
      if (!mountedRef.current) return;

      if (response.code === 0 && response.data) {
        const newData = response.data;
        
        // 只在数据真正变化时更新
        const dataChanged = !cached?.data || 
          JSON.stringify(newData.map(item => item._id)) !== 
          JSON.stringify(cached.data.map(item => item._id));
        
        if (dataChanged) {
          console.log('loadStyleList newData', newData);
          setStyleList(newData);
          updateLocalCache(newData);
        }
      } else {
        throw new Error(response.message || 'loadStyleList 获取数据失败');
      }
    } catch (err) {
      // 如果组件已卸载，不更新状态
      if (!mountedRef.current) return;

      console.error('加载视频风格列表失败:', err);
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      // 如果组件已卸载，不更新状态
      if (!mountedRef.current) return;

      setLoading(false);
      setRefreshing(false);
    }
  }, [getLocalData, updateLocalCache]);

  /**
   * 重试加载
   */
  const handleRetry = useCallback(() => {
    loadStyleList();
  }, [loadStyleList]);

  /**
   * 处理风格选择
   */
  const handleStyleSelect = (style: VideoStyleItem) => {
    onSelect({
      _id: style._id,
      ratio: style.ratio,
      resolution: style.resolution,
      styleName: style.styleName,
      stylePreviewUrl: style.previewUrl,
      videoShowRatio: style.videoShowRatio,
      font: style.font
    });
  };

  // 初始加载
  useEffect(() => {
    // 重置mounted状态
    mountedRef.current = true;
    loadStyleList();

    // 清理函数
    return () => {
      mountedRef.current = false;
      // 清除可能存在的重试定时器
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, [loadStyleList]);

  /**
   * 处理背景点击事件（关闭弹窗）
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    // 仅当点击的是背景元素时关闭
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="style-select-overlay" onClick={handleBackdropClick}>
      <div className="style-select-container" onClick={e => e.stopPropagation()}>
        {/* 顶部标题栏 */}
        <div className="style-select-header">
          <div className="style-select-title">
            选择视频风格
            {refreshing && <div className="material-loading-indicator" />}
          </div>
          <div className="style-select-close" onClick={onClose}>✕</div>
        </div>

        {/* 内容区域 */}
        <div className="style-select-content">
          {loading ? (
            <div className="material-loading">
              <div className="material-loading-spinner" />
              <div className="material-loading-text">加载中...</div>
            </div>
          ) : error ? (
            <div className="style-error-message">
              <div className="error-text">{error}</div>
              <div className="error-retry" onClick={handleRetry}>重试</div>
            </div>
          ) : (
            <div className="style-grid">
              {styleList.map(item => (
                <StyleItem
                  key={item._id}
                  item={item}
                  selected={currentStyleId === item._id}
                  onClick={handleStyleSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StyleSelectModal; 