/**
 * 音色选择弹窗组件
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import VoiceSettingPanel from './VoiceSettingPanel';
import VirtualizedVoiceGrid from './VirtualizedVoiceGrid';
import VoiceFilterPanel from './VoiceFilterPanel';
import { VoiceService, VoiceInfo, TopBarItem } from '../../api/VoiceService';
import { getFilters, setFilters, hasActiveFilters } from '../../store/filterStore';
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
  defaultVoice?: VoiceInfo;
}

/**
 * 音色选择弹窗组件
 */
const VoiceSelectModal: React.FC<VoiceSelectModalProps> = ({
  show,
  onClose,
  onSelect,
  initialSelectedVoiceId,
  defaultVoice
}) => {
  // 状态管理
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(initialSelectedVoiceId || null);
  const [showSettings, setShowSettings] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [topBar, setTopBar] = useState<TopBarItem[]>([]);
  const [currentTabId, setCurrentTabId] = useState<string>('all');
  const [hasMore, setHasMore] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  
  const tabsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // 使用ref来跟踪loading状态和内存缓存
  const loadingRef = useRef(false);
  const memoryCache = useRef<Record<string, VoiceInfo[]>>({});
  const isTopBarInitialized = useRef(false);
  const lastSelectedTabRef = useRef<string | null>(null);

  // 添加一个 ref 来存储默认音色
  const defaultVoiceRef = useRef<VoiceInfo | undefined>(defaultVoice);

  // 更新默认音色 ref
  useEffect(() => {
    defaultVoiceRef.current = defaultVoice;
  }, [defaultVoice]);

  // 获取选中的音色信息
  const selectedVoice = voices.find(v => v.voiceCode === selectedVoiceId) || null;

  /**
   * 处理默认音色和去重
   */
  const handleDefaultVoice = useCallback((voiceList: VoiceInfo[]): VoiceInfo[] => {
    if (!defaultVoiceRef.current) return voiceList;

    // 从列表中移除与默认音色相同的音色
    const filteredVoices = voiceList.filter(voice => 
      voice.voiceCode !== defaultVoiceRef.current?.voiceCode
    );

    // 将默认音色添加到列表开头
    return [defaultVoiceRef.current, ...filteredVoices];
  }, []);

  /**
   * 处理音色列表更新
   */
  const updateVoiceList = useCallback((newVoices: VoiceInfo[], isReset: boolean, currentTab?: TopBarItem) => {
    // 如果是 "全部" 标签页，处理默认音色
    if (currentTab?.type === 'all') {
      if (isReset) {
        // 重置时，确保默认音色在第一位
        setVoices(handleDefaultVoice(newVoices));
      } else {
        // 加载更多时，只需要去重，不需要将默认音色放在首位
        setVoices(prev => {
          const filteredNewVoices = newVoices.filter(voice => 
            voice.voiceCode !== defaultVoiceRef.current?.voiceCode
          );
          return [...prev, ...filteredNewVoices];
        });
      }
    } else {
      // 非 "全部" 标签页，直接设置数据
      if (isReset) {
        setVoices(newVoices);
      } else {
        setVoices(prev => [...prev, ...newVoices]);
      }
    }
  }, [handleDefaultVoice]);

  // 加载音色数据
  const loadVoiceData = useCallback(async (tabId: string, reset: boolean = false) => {
    if (loadingRef.current && !reset) {
      return;
    }

    try {
      const currentPageIndex = reset ? 1 : pageIndex;
      const currentTab = topBar.find(t => t.id === tabId);

      // 构建查询参数
      const params = {
        pageSize: 1000,
        pageIndex: currentPageIndex,
        ...(currentTab?.type !== 'all' && {
          ...(currentTab?.type === 'fav' ? { fav: true } : {}),
          ...(currentTab?.type === 'hot' ? { hot: true } : {}),
          ...(currentTab?.type === 'tag' && currentTab?.filter || {})
        })
      };

      // 如果是重置加载，检查内存缓存
      if (reset && memoryCache.current[tabId]) {
        updateVoiceList(memoryCache.current[tabId], true, currentTab);
        setLoading(false);
        return;
      }

      // 生成缓存键
      const cacheKey = VoiceService.generateCacheKey(params);

      // 如果是重置加载，先尝试从磁盘缓存获取数据
      if (reset) {
        const cachedData = VoiceService.getFromCache(cacheKey);
        if (cachedData) {
          updateVoiceList(cachedData.data.content, true, currentTab);
          
          // 只在首次加载时更新topBar
          if (!isTopBarInitialized.current) {
            setTopBar(cachedData.data.topbar);
            isTopBarInitialized.current = true;
            
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
          return;
        }
      }

      // 请求新数据
      loadingRef.current = true;
      if (reset && !memoryCache.current[tabId]) {
        setLoading(true);
      }

      const response: VoiceQueryResponse = await VoiceService.queryVoices(params);
      
      if (response.code === 0) {
        setError(null);
        
        if (response.data?.content?.length > 0) {
          if (reset) {
            const processedVoices = response.data.content;
            updateVoiceList(processedVoices, true, currentTab);
            
            // 更新缓存
            memoryCache.current[tabId] = processedVoices;
            VoiceService.saveToCache(cacheKey, response);

            // 只在首次加载时更新topBar
            if (!isTopBarInitialized.current) {
              setTopBar(response.data.topbar);
              isTopBarInitialized.current = true;
              
              if (!lastSelectedTabRef.current) {
                const allTab = response.data.topbar.find(t => t.type === 'all');
                if (allTab?.id) {
                  lastSelectedTabRef.current = allTab.id;
                  setCurrentTabId(allTab.id);
                }
              }
            }
          } else {
            updateVoiceList(response.data.content, false, currentTab);
          }
          
          setHasMore(response.data.pages.hasMore);
          if (!reset) {
            setPageIndex(prev => prev + 1);
          }
        } else if (reset) {
          // 如果是重置请求且没有数据
          if (currentTab?.type === 'all' && defaultVoiceRef.current) {
            setVoices([defaultVoiceRef.current]);
          } else {
            setVoices([]);
          }
          setHasMore(false);
        }
      } else {
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
  }, [pageIndex, currentTabId, updateVoiceList]);

  // 处理Tab切换
  const handleTabChange = useCallback((tabId: string) => {
    if (currentTabId === tabId) return; // 如果是同一个tab，不重复加载
    console.log('handleTabChange 切换tab', tabId);
    lastSelectedTabRef.current = tabId; // 记录当前选中的tab
    setCurrentTabId(tabId);
    setPageIndex(1);
    loadVoiceData(tabId, true);
  }, [currentTabId, loadVoiceData]);

  // 处理滚动加载更多
  const loadMoreItems = useCallback(() => {
    if (!hasMore || loadingRef.current) return Promise.resolve();
    return loadVoiceData(currentTabId);
  }, [hasMore, currentTabId, loadVoiceData]);

  // 判断某一项是否已加载
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
      
      // 如果有默认音色，设置为选中状态
      if (defaultVoiceRef.current) {
        setSelectedVoiceId(defaultVoiceRef.current.voiceCode);
      }
      
      loadVoiceData(initialTabId, true);
    }
  }, [show, loadVoiceData]);

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
      setShowFilter(false);
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
    setSelectedVoiceId(id);
  }, []);
  
  // 处理收藏切换
  const handleFavoriteToggle = useCallback((id: string, isFavorite: boolean) => {
    setVoices(prev => prev.map(v => 
      v.voiceCode === id ? { ...v, isFav: isFavorite } : v
    ));
    
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
    setSelectedVoiceId(id);
    if (id === selectedVoiceId) {
      setShowSettings(true);
    }
  }, [selectedVoiceId]);
  
  // 处理设置变更
  const handleSettingsChange = useCallback((voiceCode: string, settings: { 
    speed: number; 
    pitch: number; 
    intensity: number;
    volume: number;
    emotion?: string;
  }) => {
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
    setShowFilter(true);
  }, []);

  // 处理筛选确认
  const handleFilterConfirm = useCallback((newFilters: { gender?: string; age?: string }) => {
    console.log('应用筛选条件:', newFilters);
    
    // 1. 更新静态筛选参数
    setFilters(newFilters);
    
    // 2. 关闭筛选面板
    setShowFilter(false);

    // 3. 清空所有内存缓存，因为筛选条件会影响所有标签页的数据
    memoryCache.current = {};

    // 4. 重置页码
    setPageIndex(1);

    // 5. 重置hasMore状态
    setHasMore(true);

    // 6. 清空当前列表数据
    setVoices([]);

    // 7. 重新加载当前tab的数据
    loadVoiceData(currentTabId, true);
  }, [currentTabId, loadVoiceData]);
  
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
          <div 
            className={`voice-select-modal-filter ${hasActiveFilters() ? 'active' : ''}`} 
            onClick={handleFilterClick}
          >
            <FilterIcon width={24} height={24} />
            {hasActiveFilters() && <div className="voice-filter-badge" />}
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

        {/* 筛选面板 */}
        <VoiceFilterPanel
          show={showFilter}
          onClose={() => setShowFilter(false)}
          onConfirm={handleFilterConfirm}
          initialFilters={getFilters()}
        />
      </div>
    </div>,
    document.body
  );
};

export default VoiceSelectModal;