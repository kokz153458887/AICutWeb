/**
 * 视频风格项组件
 * 负责展示单个视频风格的信息，包括图片和名称
 */
import React from 'react';
import '../../styles/StyleItem.css';
import { VideoStyleItem } from '../../api/types';

interface StyleItemProps {
  item: VideoStyleItem;
  selected: boolean;
  onClick: (item: VideoStyleItem) => void;
  onEdit?: (item: VideoStyleItem) => void;  // 添加编辑功能
}

/**
 * 视频风格项组件
 */
const StyleItem: React.FC<StyleItemProps> = ({ 
  item, 
  selected, 
  onClick,
  onEdit
}) => {
  /**
   * 处理点击事件
   */
  const handleClick = () => {
    onClick(item);
  };

  /**
   * 处理编辑点击事件
   */
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止冒泡，避免触发选择事件
    if (onEdit) {
      onEdit(item);
    }
  };

  return (
    <div 
      className={`style-item ${selected ? 'selected' : ''}`} 
      onClick={handleClick}
    >
      {onEdit && (
        <div className="style-item-edit-button" onClick={handleEditClick}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.5 1.5L12.5 3.5M1.5 12.5H3.5L11.5 4.5L9.5 2.5L1.5 10.5V12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
      
      <div className="style-item-image-container">
        <img 
          src={item.previewUrl} 
          alt={item.styleName} 
          className="style-item-image"
          loading="lazy"
        />
      </div>
      
      <div className="style-item-info">
        <div className="style-item-title">{item.styleName}</div>
      </div>
      
      {selected && (
        <div className="style-check">✓</div>
      )}
    </div>
  );
};

export default StyleItem; 