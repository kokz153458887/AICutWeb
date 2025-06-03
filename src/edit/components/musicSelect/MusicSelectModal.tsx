/**
 * 音乐选择弹窗组件
 * 负责展示音乐列表，支持选择和预览功能
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../../styles/MusicSelectModal.css';
import '../../styles/MeterialCommon.css';
import MusicItem from './MusicItem';
import { MusicLibItem } from '../../api/types';
import { EditSelectAPI } from '../../api/EditSelectAPI';
import { ApiResponse } from '../../../types/api';

// 缓存过期时间：5分钟
const CACHE_EXPIRY_TIME = 1000 * 60 * 5;

interface MusicSelectModalProps {
  visible: boolean;
  currentMusicId?: string;
  onClose: () => void;
  onSelect: (music: MusicLibItem) => void;
}

interface CacheData {
  data: MusicLibItem[];
  timestamp: number;
}

/**
 * 音乐选择弹窗组件
 */
const MusicSelectModal: React.FC<MusicSelectModalProps> = ({
  visible,
  currentMusicId,
  onClose,
  onSelect,
}) => {
  // 音乐列表数据
  const [musicList, setMusicList] = useState<MusicLibItem[]>([]);
  // 加载状态
  const [loading, setLoading] = useState<boolean>(false);
  // 数据刷新状态
  const [refreshing, setRefreshing] = useState<boolean>(false);
  // 当前播放的音乐ID
  const [playingMusicId, setPlayingMusicId] = useState<string | null>(null);
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
      const cached = localStorage.getItem('music_list_cache');
      if (!cached) return null;
      
      const parsedCache = JSON.parse(cached) as CacheData;
      if (Date.now() - parsedCache.timestamp > CACHE_EXPIRY_TIME) {
        localStorage.removeItem('music_list_cache');
        return null;
      }
      
      return parsedCache;
    } catch (err) {
      console.error('读取缓存数据失败:', err);
      localStorage.removeItem('music_list_cache');
      return null;
    }
  }, []);

  /**
   * 更新本地存储缓存
   */
  const updateLocalCache = useCallback((data: MusicLibItem[]) => {
    try {
      const cacheData: CacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem('music_list_cache', JSON.stringify(cacheData));
    } catch (err) {
      console.error('更新缓存数据失败:', err);
    }
  }, []);

  /**
   * 加载音乐列表数据
   */
  const loadMusicList = useCallback(async () => {
    // 如果组件已卸载，不执行加载
    if (!mountedRef.current) return;

    try {
      setError('');
      const cached = getLocalData();
      
      if (cached?.data && cached.data.length > 0) {
        setMusicList(cached.data);
        setLoading(false);
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // 添加超时处理
      const response = await Promise.race([
        EditSelectAPI.getMusicList(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('请求超时')), 10000)
        )
      ]) as ApiResponse<MusicLibItem[]>;
      // 如果组件已卸载，不更新状态
      if (!mountedRef.current) return;

      if (response.code === 0) {
        const newData = response.data;
        
        // 只在数据真正变化时更新
        const dataChanged = !cached?.data || 
          JSON.stringify(newData.map(item => item._id)) !== 
          JSON.stringify(cached.data.map(item => item._id));
        
        if (dataChanged) {
          console.log('loadMusicList newData', newData);
          setMusicList(newData);
          updateLocalCache(newData);
        }
      } else {
        throw new Error('loadMusicList 获取数据失败');
      }
    } catch (err) {
      // 如果组件已卸载，不更新状态
      if (!mountedRef.current) return;

      console.error('加载音乐列表失败:', err);
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      // 如果组件已卸载，不更新状态
      if (!mountedRef.current) return;

      setLoading(false);
      setRefreshing(false);
    }
  }, [getLocalData, updateLocalCache]);

  /**
   * 处理音乐播放
   */
  const handleMusicPlay = useCallback((music: MusicLibItem) => {
    setPlayingMusicId(playingMusicId === music._id ? null : music._id);
  }, [playingMusicId]);

  /**
   * 重试加载
   */
  const handleRetry = useCallback(() => {
    loadMusicList();
  }, [loadMusicList]);

  // 初始加载
  useEffect(() => {
    // 重置mounted状态
    mountedRef.current = true;

    if (visible) {
      loadMusicList();
    } else {
      // 关闭模态框时停止播放
      setPlayingMusicId(null);
    }

    // 清理函数
    return () => {
      mountedRef.current = false;
      // 清除可能存在的重试定时器
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, [visible, loadMusicList]);

  if (!visible) return null;

  return (
    <div className="music-select-overlay" onClick={onClose}>
      <div className="music-select-container" onClick={e => e.stopPropagation()}>
        {/* 顶部标题栏 */}
        <div className="music-select-header">
          <div className="music-select-title">
            选择背景音乐
            {refreshing && <div className="material-loading-indicator" />}
          </div>
          <div className="music-select-close" onClick={onClose}>✕</div>
        </div>

        {/* 内容区域 */}
        <div className="music-select-content">
          {loading ? (
            <div className="material-loading">
              <div className="material-loading-spinner" />
              <div className="material-loading-text">加载中...</div>
            </div>
          ) : error ? (
            <div className="music-error-message">
              <div className="error-text">{error}</div>
              <div className="error-retry" onClick={handleRetry}>重试</div>
            </div>
          ) : (
            <div className="music-list">
              {musicList.map(item => (
                <MusicItem
                  key={item._id}
                  item={item}
                  selected={currentMusicId === item._id}
                  playing={playingMusicId === item._id}
                  onClick={onSelect}
                  onPlayClick={handleMusicPlay}
                />
              ))}
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="music-select-footer">
          <div className="music-select-cancel" onClick={onClose}>取消</div>
        </div>
      </div>
    </div>
  );
};

export default MusicSelectModal; 