/**
 * 素材库详情页面
 * 展示指定素材库中的所有文件和文件夹
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MaterialLibItem } from '../../api/types';
import { MaterialRoot, MaterialFileItem, BreadcrumbItem } from './types';
import MaterialFileCard from './MaterialFileCard';
import VideoPlayer from './VideoPlayer';
import { toast } from '../../../components/Toast';
import './styles/MaterialLibraryPage.css';

/**
 * 素材库详情页面组件
 */
const MaterialLibraryPage: React.FC = () => {
  const { materialId } = useParams<{ materialId: string }>();
  const navigate = useNavigate();
  
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [materialInfo, setMaterialInfo] = useState<MaterialLibItem | null>(null);
  const [rootData, setRootData] = useState<MaterialRoot | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  
  // 基础URL构建：域名 + /material
  const baseUrl = useMemo(() => {
    if (!materialInfo?.url) return '';
    const url = materialInfo.url;
    // 从 "http://192.168.3.17:5127/static/material/a.json" 提取 "http://192.168.3.17:5127"
    const urlParts = url.split('/');
    const protocol = urlParts[0]; // "http:"
    const domain = urlParts[2]; // "192.168.3.17:5127"
    return `${protocol}//${domain}/material`;
  }, [materialInfo?.url]);

  /**
   * 获取当前目录下的文件
   */
  const getCurrentItems = useMemo(() => {
    if (!rootData) return [];
    
    let currentItems = rootData.children;
    
    // 根据当前路径导航到正确的目录
    for (const pathSegment of currentPath) {
      const found = currentItems.find(item => 
        item.type === 'directory' && item.name === pathSegment
      );
      if (found && found.children) {
        currentItems = found.children;
      } else {
        return [];
      }
    }
    
    return currentItems;
  }, [rootData, currentPath]);

  /**
   * 搜索功能
   */
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return getCurrentItems;
    
    const query = searchQuery.toLowerCase();
    const allFiles: (MaterialFileItem & { fullPath: string })[] = [];
    
    // 递归搜索所有文件
    const searchInDirectory = (items: MaterialFileItem[], pathPrefix: string = '') => {
      items.forEach(item => {
        const itemPath = pathPrefix ? `${pathPrefix}/${item.name}` : item.name;
        
        if (item.name.toLowerCase().includes(query)) {
          allFiles.push({
            ...item,
            fullPath: itemPath
          });
        }
        
        if (item.type === 'directory' && item.children) {
          searchInDirectory(item.children, itemPath);
        }
      });
    };
    
    if (rootData) {
      searchInDirectory(rootData.children);
    }
    
    // 排序：startsWith 优先，然后按名称排序
    return allFiles.sort((a, b) => {
      const aStartsWith = a.name.toLowerCase().startsWith(query);
      const bStartsWith = b.name.toLowerCase().startsWith(query);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      return a.name.localeCompare(b.name);
    });
  }, [getCurrentItems, searchQuery, rootData]);

  /**
   * 排序后的展示项目
   */
  const sortedItems = useMemo(() => {
    if (searchQuery.trim()) return searchResults;
    
    return [...getCurrentItems].sort((a, b) => {
      // 文件夹排在前面
      if (a.type === 'directory' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'directory') return 1;
      
      // 按创建时间排序（最新的在前）
      if (a.create_time && b.create_time) {
        return new Date(b.create_time).getTime() - new Date(a.create_time).getTime();
      }
      
      // 按名称排序
      return a.name.localeCompare(b.name);
    });
  }, [getCurrentItems, searchResults, searchQuery]);

  /**
   * 初始化加载数据
   */
  useEffect(() => {
    const loadMaterialData = async () => {
      if (!materialId) {
        setError('素材ID不存在');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // 从localStorage获取素材信息，或者调用API获取
        const storedMaterials = localStorage.getItem('material_list_cache');
        let materialInfo: MaterialLibItem | null = null;
        
        if (storedMaterials) {
          const materials: MaterialLibItem[] = JSON.parse(storedMaterials);
          materialInfo = materials.find(m => m._id === materialId) || null;
        }
        
        if (!materialInfo?.url) {
          setError('找不到素材信息或素材URL');
          setLoading(false);
          return;
        }
        
        setMaterialInfo(materialInfo);
        
        // 获取素材库JSON数据
        const response = await fetch(materialInfo.url);
        if (!response.ok) {
          throw new Error('获取素材库数据失败');
        }
        
        const data: MaterialRoot = await response.json();
        setRootData(data);
        
        // 初始化面包屑
        setBreadcrumbs([{ name: data.name, path: '' }]);
        
        setError(null);
      } catch (err) {
        console.error('加载素材库数据失败:', err);
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadMaterialData();
  }, [materialId]);

  /**
   * 处理文件夹点击
   */
  const handleFolderClick = (folderName: string) => {
    const newPath = [...currentPath, folderName];
    setCurrentPath(newPath);
    
    // 更新面包屑
    const newBreadcrumbs = [
      ...breadcrumbs,
      { name: folderName, path: newPath.join('/') }
    ];
    setBreadcrumbs(newBreadcrumbs);
    
    // 清空选中状态
    setSelectedItems(new Set());
  };

  /**
   * 处理面包屑点击
   */
  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      // 返回根目录
      setCurrentPath([]);
      setBreadcrumbs([breadcrumbs[0]]);
    } else {
      // 返回指定目录
      const targetBreadcrumb = breadcrumbs[index];
      const newPath = targetBreadcrumb.path.split('/').filter(p => p);
      setCurrentPath(newPath);
      setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    }
    
    // 清空选中状态
    setSelectedItems(new Set());
  };

  /**
   * 处理返回按钮点击
   */
  const handleBackClick = () => {
    navigate(-1);
  };

  /**
   * 处理文件点击（播放视频）
   */
  const handleFileClick = (item: MaterialFileItem) => {
    if (item.type === 'file' && item.relative_path) {
      // 构建完整的视频URL：baseUrl + rootName + currentPath + relative_path
      let fullVideoUrl = baseUrl;
      if (rootData?.name) {
        fullVideoUrl += `/${rootData.name}`;
      }
 
      // relative_path 可能包含相对路径，直接使用，不要重复拼接当前路径
      fullVideoUrl += `/${item.relative_path}`;
      
      // 统一使用正斜杠，避免重复的斜杠
      fullVideoUrl = fullVideoUrl.replace(/\\/g, '/').replace(/\/+/g, '/').replace('http:/', 'http://').replace('https:/', 'https://');
      
      setCurrentVideoUrl(fullVideoUrl);
      setShowVideoPlayer(true);
    }
  };

  /**
   * 处理项目选中
   */
  const handleItemSelect = (itemName: string, selected: boolean) => {
    const newSelectedItems = new Set(selectedItems);
    if (selected) {
      newSelectedItems.add(itemName);
    } else {
      newSelectedItems.delete(itemName);
    }
    setSelectedItems(newSelectedItems);
  };

  /**
   * 处理取消选择
   */
  const handleCancelSelection = () => {
    setSelectedItems(new Set());
  };

  /**
   * 处理删除操作
   */
  const handleDeleteSelected = () => {
    toast.info('功能待开发');
  };

  if (loading) {
    return (
      <div className="material-library-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">加载中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="material-library-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-text">{error}</div>
          <div className="retry-button" onClick={() => window.location.reload()}>
            重试
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="material-library-page">
      {/* 顶部导航栏 */}
      <div className="meterial-page-header">
        <div className="meterial-back-button" onClick={handleBackClick}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <h1 className="page-title">{materialInfo?.name || '素材库'}</h1>
      </div>

      {/* 搜索框 */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="search-icon">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <input
            type="text"
            placeholder="搜索文件..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <div 
              className="clear-search-button"
              onClick={() => setSearchQuery('')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* 面包屑导航 */}
      {!searchQuery && (
        <div className="breadcrumb-container">
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={index}>
              <div
                className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
                onClick={() => index !== breadcrumbs.length - 1 && handleBreadcrumbClick(index)}
              >
                {breadcrumb.name}
              </div>
              {index < breadcrumbs.length - 1 && (
                <span className="breadcrumb-separator">/</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* 文件网格 */}
      <div className="files-grid-container">
        <div className="files-grid">
          {sortedItems.map((item, index) => (
            <MaterialFileCard
              key={`${item.name}-${index}`}
              item={item}
              isSelected={selectedItems.has(item.name)}
              baseUrl={baseUrl}
              rootName={rootData?.name || ''}
              currentPath={searchQuery ? [] : currentPath}
              onFolderClick={searchQuery ? undefined : handleFolderClick}
              onFileClick={handleFileClick}
              onSelectionChange={handleItemSelect}
              showFullPath={!!searchQuery}
            />
          ))}
        </div>
        {sortedItems.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <div className="empty-text">
              {searchQuery ? '未找到匹配的文件' : '文件夹为空'}
            </div>
          </div>
        )}
      </div>

      {/* 选中状态底部栏 */}
      {selectedItems.size > 0 && (
        <div className="selection-bottom-bar">
          <div className="cancel-button" onClick={handleCancelSelection}>
            取消
          </div>
          <div className="selection-info">
            已选择 {selectedItems.size} 个
          </div>
          <div className="delete-button" onClick={handleDeleteSelected}>
            删除
          </div>
        </div>
      )}

      {/* 视频播放器 */}
      {showVideoPlayer && (
        <VideoPlayer
          videoUrl={currentVideoUrl}
          onClose={() => setShowVideoPlayer(false)}
        />
      )}
    </div>
  );
};

export default MaterialLibraryPage; 