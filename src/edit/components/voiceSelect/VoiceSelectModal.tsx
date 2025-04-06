/**
 * 音色选择弹窗组件
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MockVoiceData, VoiceInfo } from '../../mock/voiceData';
import VoiceItem from './VoiceItem';
import VoiceSettingPanel from './VoiceSettingPanel';
import VirtualizedVoiceGrid from './VirtualizedVoiceGrid';
import '../../styles/VoiceSelectModal.css';
import { FilterIcon, CheckmarkIcon, CloseIcon } from '../icons/SvgIcons';
import { toast } from '../../../components/Toast';

// Tab数据接口
interface TabItem {
  id: string;
  text: string;
}

/**
 * 音色选择弹窗属性
 */
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
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(['全部']);
  const tabsRef = useRef<HTMLDivElement>(null);
  
  // 容器引用，用于获取尺寸
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // 获取选中的音色信息
  const selectedVoice = voices.find(v => v.id === selectedVoiceId) || null;
  
  // 加载音色分类和初始数据
  useEffect(() => {
    if (show) {
      try {
        setLoading(true);
        const voiceData = MockVoiceData.getInstance();
        const categoriesData = voiceData.getVoiceCategories();
        setCategories(['全部', ...categoriesData]);
        
        const voicesData = voiceData.getVoicesByCategory(null);
        setVoices(voicesData);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('加载音色数据失败:', err);
        setError('加载音色数据失败，请稍后重试');
        setLoading(false);
      }
    }
  }, [show]);
  
  // 加载音色数据
  useEffect(() => {
    if (!show || selectedCategory === '全部' && voices.length > 0) return;
    
    try {
      setLoading(true);
      const voiceData = MockVoiceData.getInstance();
      const voicesData = voiceData.getVoicesByCategory(
        selectedCategory === '全部' ? null : selectedCategory
      );
      setVoices(voicesData);
      setLoading(false);
    } catch (err) {
      console.error('加载音色数据失败:', err);
      setError('加载音色数据失败，请稍后重试');
      setLoading(false);
    }
  }, [selectedCategory, show, voices.length]);
  
  // 监听容器尺寸变化
  useEffect(() => {
    if (!show) return;
    
    const updateContainerSize = () => {
      if (gridContainerRef.current) {
        const width = gridContainerRef.current.clientWidth;
        const height = gridContainerRef.current.clientHeight;
        
        if (width > 0 && height > 0) {
          console.log('容器尺寸更新:', width, height);
          setContainerSize({
            width,
            height
          });
        }
      }
    };
    
    // 初始尺寸可能为0，使用多个延时来尝试获取
    const timer1 = setTimeout(updateContainerSize, 0);
    const timer2 = setTimeout(updateContainerSize, 100);
    const timer3 = setTimeout(updateContainerSize, 300);
    
    // 监听窗口调整事件
    window.addEventListener('resize', updateContainerSize);
    
    // 清理
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener('resize', updateContainerSize);
    };
  }, [show, selectedCategory]);
  
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
      onSelect?.(selectedVoice);
    }
    handleClose();
  }, [selectedVoice, onSelect, handleClose]);
  
  // 处理分类点击
  const handleCategoryClick = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);
  
  // 处理标签滚动
  const scrollTabsLeft = useCallback(() => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: -100, behavior: 'smooth' });
    }
  }, []);

  const scrollTabsRight = useCallback(() => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: 100, behavior: 'smooth' });
    }
  }, []);
  
  // 处理音色点击
  const handleVoiceSelect = useCallback((id: string) => {
    setSelectedVoiceId(prevId => {
      // 如果当前已选中了点击的音色，则不做任何更改
      if (prevId === id) {
        return prevId;
      }
      // 否则选中新点击的音色
      return id;
    });
  }, []);
  
  // 处理收藏切换
  const handleFavoriteToggle = useCallback((id: string, isFavorite: boolean) => {
    const voiceData = MockVoiceData.getInstance();
    voiceData.saveFavorite(id, isFavorite);
    
    // 更新状态
    setVoices(prev => prev.map(v => 
      v.id === id ? { ...v, favorite: isFavorite } : v
    ));
  }, []);
  
  // 处理设置点击
  const handleSettingsClick = useCallback((id: string) => {
    // 确保弹出的设置面板对应当前选中的音色
    if (id === selectedVoiceId) {
      setShowSettings(true);
    } else {
      // 如果点击了未选中Item的设置按钮，先选中该Item
      setSelectedVoiceId(id);
      // 不立即显示设置面板，用户需要再次点击设置按钮
    }
  }, [selectedVoiceId]);
  
  // 处理设置变更
  const handleSettingsChange = useCallback((voiceCode: string, settings: { speed: number; pitch: number; intensity: number }) => {
    const voiceData = MockVoiceData.getInstance();
    voiceData.saveSettings(voiceCode, settings);
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
              {categories.map(category => (
                <div
                  key={category}
                  className={`voice-select-modal-tab ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
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
        <div className="voice-select-modal-content">
          <div 
            className="voice-select-modal-grid" 
            ref={gridContainerRef}
            style={{ 
              width: '100%', 
              height: '100%',
              position: 'relative'
            }}
          >
            {containerSize.width > 0 && containerSize.height > 0 ? (
              <VirtualizedVoiceGrid
                voices={voices}
                selectedVoiceId={selectedVoiceId}
                containerWidth={containerSize.width}
                containerHeight={containerSize.height}
                onVoiceSelect={handleVoiceSelect}
                onFavoriteToggle={handleFavoriteToggle}
                onSettingsClick={handleSettingsClick}
              />
            ) : (
              <div className="voice-select-modal-loading">加载中...</div>
            )}
          </div>
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