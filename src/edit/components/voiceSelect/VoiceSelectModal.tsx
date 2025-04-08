/**
 * 音色选择弹窗组件
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
 import VoiceSettingPanel from './VoiceSettingPanel';
import VirtualizedVoiceGrid from './VirtualizedVoiceGrid';
import { VoiceService, VoiceInfo, TopBarItem } from '../../api/VoiceService';
import '../../styles/VoiceSelectModal.css';
import { FilterIcon, CheckmarkIcon, CloseIcon } from '../icons/SvgIcons';
import { toast } from '../../../components/Toast';
import { ApiResponse } from '../../../types/api';
import { VoiceQueryResponse } from '../../api/VoiceService';

interface VoiceSelectModalProps {
  show: boolean;
  onClose: () => void;
  onSelect?: (selectedVoice: VoiceInfo | null) => void;
  initialSelectedVoiceId?: string;
}

/**
 * 音色选择弹窗组件
 */
const VoiceSelectModal: React.FC<VoiceSelectModalProps> = ({
  show,
  onClose,
  onSelect,
  initialSelectedVoiceId
}) => {
  // 状态管理
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(initialSelectedVoiceId || null);
  const [showSettings, setShowSettings] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [topBar, setTopBar] = useState<TopBarItem[]>([]);
  const [currentTabId, setCurrentTabId] = useState<string>('all');  // 使用id作为tab的唯一标识
  const [hasMore, setHasMore] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const tabsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // 使用ref来跟踪loading状态和内存缓存
  const loadingRef = useRef(false);
  const memoryCache = useRef<Record<string, VoiceInfo[]>>({});
  const isTopBarInitialized = useRef(false);
  const lastSelectedTabRef = useRef<string | null>(null);  // 记录最后选中的tab

  // 获取选中的音色信息
  const selectedVoice = voices.find(v => v.voiceCode === selectedVoiceId) || null;

  /**
   * 加载音色数据
   */
  const loadVoiceData = useCallback(async (tabId: string, reset: boolean = false) => {
    // 如果正在加载中且不是重置请求，则不重复请求
    if (loadingRef.current && !reset) {
      console.log('loadVoiceData 正在加载中且不是重置请求，则不重复请求', tabId, reset);
      return;
    }

    console.log('loadVoiceData 加载音色数据', tabId, reset);
    try {
      const currentPageIndex = reset ? 1 : pageIndex;
      const currentTab = topBar.find(t => t.id === tabId);
      const params = {
        pageSize: 100,
        pageIndex: currentPageIndex,
        ...(currentTab?.type !== 'all' && {
          ...(currentTab?.type === 'fav' ? { fav: true } : {}),
          ...(currentTab?.type === 'hot' ? { hot: true } : {}),
          ...(currentTab?.type === 'tag' && currentTab?.filter || {})
        })
      };

      // 如果是重置加载，检查内存缓存
      if (reset && memoryCache.current[tabId]) {
        console.log('loadVoiceData 使用缓存数据；memoryCache.current[tabId]', memoryCache.current[tabId]);
        setVoices(memoryCache.current[tabId]);
        setLoading(false);
        return;
      }

      // 生成缓存键
      const cacheKey = VoiceService.generateCacheKey(params);
      console.log('loadVoiceData 生成缓存键', cacheKey);

      // 如果是重置加载，先尝试从磁盘缓存获取数据
      if (reset) {
        const cachedData = VoiceService.getFromCache(cacheKey);
        console.log('loadVoiceData 从磁盘缓存获取数据', cachedData);
        if (cachedData) {
          setVoices(cachedData.data.content);
          // 只在首次加载时更新topBar
          if (!isTopBarInitialized.current) {
            console.log('loadVoiceData 更新topBar', cachedData.data.topbar);
            setTopBar(cachedData.data.topbar);
            isTopBarInitialized.current = true;
            
            // 如果没有记录最后选中的tab，使用type为all的tab
            if (!lastSelectedTabRef.current) {
              const allTab = cachedData.data.topbar.find(t => t.type === 'all');
              if (allTab?.id) {
                lastSelectedTabRef.current = allTab.id;
                setCurrentTabId(allTab.id);
              }
            }
          }
          setHasMore(cachedData.data.pages.hasMore);
          setLoading(false);
        }
      }

      // 无论是否有缓存，都请求新数据
      loadingRef.current = true;
      if (reset && !memoryCache.current[tabId]) {
        setLoading(true);
      }
      console.log('loadVoiceData 请求新数据', params);
      // 请求新数据
      const response: VoiceQueryResponse = await VoiceService.queryVoices(params);
      console.log('loadVoiceData 请求新数据', response);
      if (response.code === 0) {
        // 成功响应时，清空错误状态
        setError(null);
        
        if (response.data?.content?.length > 0) {
          if (reset) {
            setVoices(response.data.content);
            // 只在首次加载时更新topBar
            if (!isTopBarInitialized.current) {
              console.log('loadVoiceData 更新topBar', response.data.topbar);
              setTopBar(response.data.topbar);
              isTopBarInitialized.current = true;
              
              // 如果没有记录最后选中的tab，使用type为all的tab
              if (!lastSelectedTabRef.current) {
                const allTab = response.data.topbar.find(t => t.type === 'all');
                if (allTab?.id) {
                  lastSelectedTabRef.current = allTab.id;
                  setCurrentTabId(allTab.id);
                }
              }
            }
            // 只有在有数据的情况下才进行缓存
            memoryCache.current[tabId] = response.data.content;
            // 只缓存第一页数据到磁盘
            VoiceService.saveToCache(cacheKey, response);
            console.log('loadVoiceData 缓存数据', response.data.content);
          } else {
            setVoices(prev => [...prev, ...response.data.content]);
          }
          
          setHasMore(response.data.pages.hasMore);
          if (!reset) {
            setPageIndex(prev => prev + 1);
          }
        } else if (reset) {
          // 如果是重置请求且没有数据，清空列表
          setVoices([]);
          setHasMore(false);
        }
      } else {
        console.log("loadVoiceData response:", response);
        throw new Error(response.message || '加载音色数据失败');
      }
    } catch (err) {
      console.error('加载音色数据失败:', err);
      setError('加载音色数据失败，请稍后重试');
      toast.error('加载音色数据失败，请稍后重试');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [pageIndex, currentTabId]);

  /**
   * 处理Tab切换
   */
  const handleTabChange = useCallback((tabId: string) => {
    if (currentTabId === tabId) return; // 如果是同一个tab，不重复加载
    console.log('handleTabChange 切换tab', tabId);
    lastSelectedTabRef.current = tabId; // 记录当前选中的tab
    setCurrentTabId(tabId);
    setPageIndex(1);
    loadVoiceData(tabId, true);
  }, [currentTabId, loadVoiceData]);

  /**
   * 处理滚动加载更多
   */
  const loadMoreItems = useCallback(() => {
    if (!hasMore || loadingRef.current) return Promise.resolve();
    return loadVoiceData(currentTabId);
  }, [hasMore, currentTabId, loadVoiceData]);

  /**
   * 判断某一项是否已加载
   */
  const isItemLoaded = useCallback((index: number) => {
    return !hasMore || index < voices.length;
  }, [hasMore, voices.length]);

  // 初始化加载
  useEffect(() => {
    if (show) {
      console.log('useEffect 初始化加载');
      // 重置topBar初始化状态
      isTopBarInitialized.current = false;
      // 使用记录的tab或默认使用'all'
      const initialTabId = lastSelectedTabRef.current || 'all';
      loadVoiceData(initialTabId, true);
    }
  }, [show]);

  // 监听容器尺寸变化
  useEffect(() => {
    if (!show || !containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [show]);

  // 处理关闭
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setShowSettings(false);
    }, 300);
  }, [onClose]);
  
  // 处理确认
  const handleConfirm = useCallback(() => {
    if (selectedVoice) {
      console.log('handleConfirm 确认选择音色:', {
        voiceCode: selectedVoice.voiceCode,
        voiceName: selectedVoice.voiceName,
        voiceServer: selectedVoice.voiceServer,
        settings: selectedVoice.settings
      });
      onSelect?.(selectedVoice);
    }
    handleClose();
  }, [selectedVoice, onSelect, handleClose]);
  
  // 处理音色点击
  const handleVoiceSelect = useCallback((id: string) => {
    // 不再在这里处理选中状态，而是在 VoiceItem 中处理
    setSelectedVoiceId(id);
  }, []);
  
  // 处理收藏切换
  const handleFavoriteToggle = useCallback((id: string, isFavorite: boolean) => {
    // 更新状态
    setVoices(prev => prev.map(v => 
      v.voiceCode === id ? { ...v, isFav: isFavorite } : v
    ));
    
    // 保存到本地存储
    try {
      const favorites = JSON.parse(localStorage.getItem('voice_favorites') || '{}');
      favorites[id] = isFavorite;
      localStorage.setItem('voice_favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('保存收藏状态失败:', error);
    }
  }, []);
  
  // 处理设置点击
  const handleSettingsClick = useCallback((id: string) => {
    console.log('handleSettingsClick 点击设置按钮', id);
    // 如果点击了未选中Item的设置按钮，先选中该Item
    setSelectedVoiceId(id);
    // 只有在当前已选中的情况下才显示设置面板
    if (id === selectedVoiceId) {
      setShowSettings(true);
    }
  }, [selectedVoiceId]);
  
  // 处理设置变更
  const handleSettingsChange = useCallback((voiceCode: string, settings: { 
    speed: number; 
    pitch: number; 
    intensity: number;
    emotion?: string;
  }) => {
    // 更新音色列表中的设置
    setVoices(prev => prev.map(v => {
      if (v.voiceCode === voiceCode) {
        console.log('更新音色设置:', {
          voiceCode,
          settings
        });
        return { 
          ...v, 
          settings
        };
      }
      return v;
    }));
  }, []);
  
  // 处理筛选点击
  const handleFilterClick = useCallback(() => {
    toast.info('筛选功能开发中...');
  }, []);
  
  if (!show) {
    return null;
  }
  
  return createPortal(
    <div className={`voice-select-modal-backdrop ${show ? 'visible' : ''} ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div 
        className={`voice-select-modal ${show ? 'visible' : ''} ${isClosing ? 'closing' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {/* 头部区域 */}
        <div className="voice-select-modal-header">
          <div className="voice-select-modal-filter" onClick={handleFilterClick}>
            <FilterIcon width={24} height={24} />
          </div>
          
          <div className="voice-select-modal-tabs-container">
            <div className="voice-select-modal-tabs" ref={tabsRef}>
              {topBar.map((item, index) => (
                <div
                  key={item.id || `${item.type}_${index}`}
                  className={`voice-select-modal-tab ${currentTabId === item.id ? 'active' : ''}`}
                  onClick={() => handleTabChange(item.id || '')}
                >
                  {item.text}
                </div>
              ))}
            </div>
          </div>
          
          <div className="voice-select-modal-header-actions">
            {selectedVoice && (
              <div className="voice-select-modal-confirm" onClick={handleConfirm}>
                <CheckmarkIcon width={20} height={20} />
              </div>
            )}
            
            <div className="voice-select-modal-close" onClick={handleClose}>
              <CloseIcon width={20} height={20} />
            </div>
          </div>
        </div>
        
        {/* 内容区域 */}
        <div className="voice-select-modal-content" ref={containerRef}>
          {loading && voices.length === 0 ? (
            <div className="voice-select-modal-loading">加载中，请稍后...</div>
          ) : error ? (
            <div className="voice-select-modal-error">{error}</div>
          ) : (
            containerSize.width > 0 && containerSize.height > 0 && (
              <VirtualizedVoiceGrid
                voices={voices}
                selectedVoiceId={selectedVoiceId}
                containerWidth={containerSize.width}
                containerHeight={containerSize.height}
                onVoiceSelect={handleVoiceSelect}
                onFavoriteToggle={handleFavoriteToggle}
                onSettingsClick={handleSettingsClick}
                hasMore={hasMore}
                isItemLoaded={isItemLoaded}
                loadMoreItems={loadMoreItems}
              />
            )
          )}
        </div>
        
        {/* 参数调整面板 */}
        {showSettings && selectedVoice && (
          <VoiceSettingPanel
            voice={selectedVoice}
            onClose={() => setShowSettings(false)}
            onSettingsChange={handleSettingsChange}
          />
        )}
      </div>
    </div>,
    document.body
  );
};

export default VoiceSelectModal;