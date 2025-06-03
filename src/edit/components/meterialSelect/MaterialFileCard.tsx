/**
 * 素材文件卡片组件
 * 展示单个文件或文件夹的信息
 */
import React, { useState } from 'react';
import { MaterialFileItem } from './types';
import './styles/MaterialFileCard.css';

interface MaterialFileCardProps {
  item: MaterialFileItem;
  isSelected: boolean;
  baseUrl: string;
  rootName: string;
  currentPath: string[];
  onFolderClick?: (folderName: string) => void;
  onFileClick: (item: MaterialFileItem) => void;
  onSelectionChange: (itemName: string, selected: boolean) => void;
  showFullPath?: boolean;
}

/**
 * 素材文件卡片组件
 */
const MaterialFileCard: React.FC<MaterialFileCardProps> = ({
  item,
  isSelected,
  baseUrl,
  rootName,
  currentPath,
  onFolderClick,
  onFileClick,
  onSelectionChange,
  showFullPath = false
}) => {
  const [imageError, setImageError] = useState(false);

  /**
   * 获取完整的图片URL
   */
  const getImageUrl = () => {
    if (!item.preview_image || imageError) return '';
    
    // 构建完整的图片URL：baseUrl + rootName + currentPath + preview_image
    let imageUrl = baseUrl;
    if (rootName) {
      imageUrl += `/${rootName}`;
    }
    
    if (showFullPath && 'fullPath' in item) {
      // 搜索模式下使用完整路径，但要排除文件名本身
      const fullPath = (item as any).fullPath;
      const pathParts = fullPath.split('/');
      pathParts.pop(); // 移除文件名
      if (pathParts.length > 0) {
        imageUrl += `/${pathParts.join('/')}`;
      }
    } 
    
    // 添加预览图片名称，不要重复添加路径
    imageUrl += `/${item.preview_image}`;
    
    // 统一使用正斜杠，避免重复的斜杠
    return imageUrl.replace(/\\/g, '/').replace(/\/+/g, '/').replace('http:/', 'http://').replace('https:/', 'https://');
  };

  /**
   * 处理卡片点击
   */
  const handleCardClick = () => {
    if (item.type === 'directory' && onFolderClick) {
      onFolderClick(item.name);
    } else if (item.type === 'file') {
      onFileClick(item);
    }
  };

  /**
   * 处理选择框区域点击
   */
  const handleSelectionAreaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange(item.name, !isSelected);
  };

  /**
   * 处理图片加载错误
   */
  const handleImageError = () => {
    setImageError(true);
  };

  /**
   * 渲染文件夹内容
   */
  const renderFolderContent = () => (
    <div className="folder-content">
      <div className="folder-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path 
            d="M10 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4Z" 
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="folder-info">
        <div className="folder-name">{item.name}</div>
        {showFullPath && 'fullPath' in item && (
          <div className="folder-path">{(item as any).fullPath}</div>
        )}
      </div>
    </div>
  );

  /**
   * 渲染文件内容
   */
  const renderFileContent = () => {
    const imageUrl = getImageUrl();
    
    return (
      <div>
        <div className="file-preview">
          {imageUrl && !imageError ? (
            <img 
              src={imageUrl} 
              alt={item.name}
              className="preview-image"
              onError={handleImageError}
            />
          ) : (
            <div className="no-preview">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" 
                  fill="currentColor"
                />
                <path d="M14 2V8H20" fill="none" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
          )}
          
          {/* 视频时长显示 */}
          {item.duration_formatted && (
            <div className="duration-badge">{item.duration_formatted}</div>
          )}
        </div>
        
        <div className="file-info">
          <div className="file-name" title={item.name}>
            {item.name}
          </div>
          
          {showFullPath && 'fullPath' in item && (
            <div className="file-path" title={(item as any).fullPath}>
              {(item as any).fullPath}
            </div>
          )}
          
          <div className="file-meta">
            {item.size_formatted && (
              <span className="size-tag">{item.size_formatted}</span>
            )}
            {item.width && item.height && (
              <span className="resolution-tag">{item.width}×{item.height}</span>
            )}
          </div>
          
          {item.create_time && (
            <div className="create-time">{item.create_time}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`material-file-card ${item.type} ${isSelected ? 'selected' : ''}`}
      onClick={handleCardClick}
    >
      {item.type === 'directory' ? renderFolderContent() : renderFileContent()}
      
      {/* 选择框区域（增大点击范围） */}
      <div 
        className="selection-area"
        onClick={handleSelectionAreaClick}
      >
        <div className={`selection-checkbox ${isSelected ? 'checked' : ''}`}>
          {isSelected && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialFileCard; 