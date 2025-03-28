/**
 * 素材选择弹窗组件
 * 负责展示素材库列表，支持选择和预览功能
 */
import React, { useState, useEffect } from 'react';
import '../styles/MaterialSelectModal.css';
import MaterialItem from './MaterialItem';
import { MaterialLibItem, MaterialModel } from '../../api/types';
import { EditSelectAPI } from '../../api/EditSelectAPI';

interface MaterialSelectModalProps {
  onClose: () => void;
  onSelect: (material: MaterialModel) => void;
  currentMaterialId?: string;
}

/**
 * 素材选择弹窗组件
 */
const MaterialSelectModal: React.FC<MaterialSelectModalProps> = ({
  onClose,
  onSelect,
  currentMaterialId
}) => {
  // 素材列表数据
  const [materials, setMaterials] = useState<MaterialLibItem[]>([]);
  // 选中的素材ID
  const [selectedId, setSelectedId] = useState<string>(currentMaterialId || '');
  // 加载状态
  const [loading, setLoading] = useState<boolean>(true);
  // 数据刷新状态
  const [refreshing, setRefreshing] = useState<boolean>(false);
  // 错误状态
  const [error, setError] = useState<string>('');

  /**
   * 从本地存储获取缓存数据
   */
  const getLocalData = (): MaterialLibItem[] => {
    try {
      const cached = localStorage.getItem('material_list_cache');
      return cached ? JSON.parse(cached) : [];
    } catch (err) {
      console.error('读取缓存数据失败:', err);
      return [];
    }
  };

  /**
   * 更新本地存储缓存
   */
  const updateLocalCache = (data: MaterialLibItem[]) => {
    try {
      localStorage.setItem('material_list_cache', JSON.stringify(data));
    } catch (err) {
      console.error('更新缓存数据失败:', err);
    }
  };

  /**
   * 加载素材列表数据
   */
  const loadMaterialList = async () => {
    try {
      // 先检查本地缓存
      const cachedData = getLocalData();
      if (cachedData.length > 0) {
        setMaterials(cachedData);
        setLoading(false);
        setRefreshing(true);
      }

      // 请求最新数据
      const response = await EditSelectAPI.getMaterialList();
      
      if (response.code === 0 && response.data) {
        const newData = response.data.data;
        
        // 比较数据是否相同
        const dataChanged = JSON.stringify(newData) !== JSON.stringify(cachedData);
        
        if (dataChanged) {
          setMaterials(newData);
          updateLocalCache(newData);
        }
      } else {
        throw new Error(response.message || '获取数据失败');
      }
    } catch (err) {
      console.error('加载素材列表失败:', err);
      setError('加载失败，请重试');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadMaterialList();
  }, []);

  /**
   * 处理素材选择
   */
  const handleItemClick = (item: MaterialLibItem) => {
    setSelectedId(item._id);
  };

  /**
   * 处理确认选择
   */
  const handleConfirm = () => {
    const selectedMaterial = materials.find(item => item._id === selectedId);
    if (selectedMaterial) {
      onSelect({
        name: selectedMaterial.name,
        materialID: selectedMaterial._id,
        previewUrl: selectedMaterial.previewUrl || ''
      });
    }
  };

  /**
   * 处理重试
   */
  const handleRetry = () => {
    setError('');
    setLoading(true);
    loadMaterialList();
  };

  return (
    <div className="material-select-overlay" onClick={onClose}>
      <div className="material-select-container" onClick={e => e.stopPropagation()}>
        {/* 顶部标题栏 */}
        <div className="material-select-header">
          <div className="material-select-title">
            选择素材库
            {refreshing && <div className="material-loading-indicator" />}
          </div>
          <div className="material-select-close" onClick={onClose}>✕</div>
        </div>

        {/* 内容区域 */}
        <div className="material-select-content">
          {loading ? (
            <div className="material-loading">
              <div className="material-loading-spinner" />
              <div className="material-loading-text">加载中...</div>
            </div>
          ) : error ? (
            <div className="material-loading">
              <div className="material-loading-text">{error}</div>
              <div className="material-retry-button" onClick={handleRetry}>重试</div>
            </div>
          ) : (
            <div className="material-grid">
              {materials.map(item => (
                <MaterialItem
                  key={item._id}
                  item={item}
                  selected={item._id === selectedId}
                  onClick={handleItemClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="material-select-footer">
          <div className="material-select-cancel" onClick={onClose}>取消</div>
          <div 
            className={`material-select-confirm ${!selectedId ? 'disabled' : ''}`}
            onClick={selectedId ? handleConfirm : undefined}
          >
            确定
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialSelectModal;