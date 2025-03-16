/**
 * 内容卡片组件
 * 负责展示单个卡片，包括封面图、文案和星星数
 */
import React, { useState, useMemo } from 'react';
import { HomeContentItem } from '../../../../types/home';
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
  item: HomeContentItem;
  onClick: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ item, onClick }) => {
  // 图片加载状态
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // 固定使用3:4比例
  const ratio = useMemo(() => {
    return { width: 3, height: 4 }; // 固定3:4比例
  }, []);
  
  // 计算图片容器的padding-top，用于保持比例
  const paddingTop = useMemo(() => {
    return `${(ratio.height / ratio.width) * 100}%`;
  }, [ratio]);
  
  // 处理图片加载完成
  const handleImageLoad = () => {
    console.log(`[ContentCard] 图片加载完成: ${item.styleId}`);
    setImageLoaded(true);
  };
  
  // 处理图片加载失败
  const handleImageError = () => {
    console.log(`[ContentCard] 图片加载失败: ${item.styleId}`);
    setImageError(true);
  };
  
  return (
    <div className="content-card" onClick={onClick}>
      <div className="image-container" style={{ paddingTop }}>
        {/* 图片加载前的占位图 */}
        {!imageLoaded && !imageError && (
          <div className="image-placeholder"></div>
        )}
        
        {/* 图片加载失败显示错误图 */}
        {imageError ? (
          <div className="image-error">
            <span className="error-icon">!</span>
            <span className="error-text">加载失败</span>
          </div>
        ) : (
          /* 图片 */
          <img
            src={item.cover}
            alt={item.styleName}
            className={`card-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
      </div>
      
      {/* 卡片内容区 */}
      <div className="card-content">
        {/* 文案，最多2行 */}
        <p className="content-text">{item.text}</p>
        
        {/* 星星数 */}
        <div className="stars-container">
          <span className="stars-icon">★</span>
          <span className="stars-count">{item.stars}</span>
        </div>
      </div>
    </div>
  );
};

export default ContentCard; 