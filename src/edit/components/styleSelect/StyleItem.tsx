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
}

/**
 * 视频风格项组件
 */
const StyleItem: React.FC<StyleItemProps> = ({ 
  item, 
  selected, 
  onClick 
}) => {
  /**
   * 处理点击事件
   */
  const handleClick = () => {
    onClick(item);
  };

  return (
    <div 
      className={`style-item ${selected ? 'selected' : ''}`} 
      onClick={handleClick}
    >
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