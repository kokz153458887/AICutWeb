/**
 * 内容卡片组件
 * 负责展示单个内容项的卡片，包括封面图、文案和星星数
 */
import React, { useState } from 'react';
import './ContentCard.css';

// 定义卡片数据接口
export interface ContentCardItem {
  styleId: string;
  styleName?: string;
  text: string;
  cover: string;
  stars: string;
  ratio?: string;
  coverRatio?: string;
  navUrl?: string;
}

interface ContentCardProps {
  item: ContentCardItem;
  onClick: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ item, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // 计算图片比例
  const imgRatio = item.coverRatio || item.ratio || '1:1';
  const [width, height] = imgRatio.split(':').map(Number);
  const aspectRatio = height / width;
  
  // 处理图片加载完成
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  // 处理图片加载失败
  const handleImageError = () => {
    setImageError(true);
  };
  
  return (
    <div className="content-card" onClick={onClick}>
      <div 
        className="card-image-container" 
        style={{ paddingBottom: `${aspectRatio * 100}%` }}
      >
        {/* 占位图 */}
        <div className={`card-image-placeholder ${imageLoaded ? 'hidden' : ''}`} />
        
        {/* 实际图片 */}
        {!imageError ? (
          <img 
            src={item.cover} 
            alt={item.text}
            className={`card-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="card-image-error">
            <span>图片加载失败</span>
          </div>
        )}
      </div>
      
      <div className="card-content">
        <p className="card-text">{item.text}</p>
        <div className="card-footer">
          <div className="card-stars">
            <svg className="star-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" fill="#FF4757"/>
            </svg>
            <span>{item.stars}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard; 