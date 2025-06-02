/**
 * 素材项组件
 * 负责展示单个素材库的信息，包括封面图、名称、标签和素材数量
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/MaterialItem.css';
import '../../styles/MeterialCommon.css';
import { MaterialLibItem } from '../../api/types';

interface MaterialItemProps {
  item: MaterialLibItem;
  selected: boolean;
  onClick: (item: MaterialLibItem) => void;
}

/**
 * 素材项组件
 */
const MaterialItem: React.FC<MaterialItemProps> = ({ item, selected, onClick }) => {
  const navigate = useNavigate();

  /**
   * 处理点击事件
   */
  const handleClick = () => {
    onClick(item);
  };

  /**
   * 处理查看图标点击
   */
  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    navigate(`/material-library/${item._id}`);
  };

  /**
   * 判断是否为合集类型
   * 根据接口文档，type字段可能是'only'或'all'
   * 这里显示特殊tag是为了区分可能的不同类型
   */
  const showCollectionTag = item.type === 'all';

  return (
    <div 
      className={`material-item ${selected ? 'selected' : ''}`} 
      onClick={handleClick}
    >
      {/* 素材封面图 */}
      <div className="material-cover-container">
        <img 
          className="material-cover" 
          src={item.coverUrl || 'https://via.placeholder.com/160x90'} 
          alt={item.name}
          loading="lazy"
        />
        {/* 选中标记 */}
        <div className="material-check">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      
      {/* 素材信息 */}
      <div className="material-info">
        <div className="material-name">{item.name}</div>
        <div className="material-meta">
          <div className="material-tags">
            {showCollectionTag && <div className="material-tag collection-tag">合集</div>}
            <div className="material-count">{item.nums || 0}个素材</div>
          </div>
          {/* 查看图标 */}
          <div className="material-view-icon" onClick={handleViewClick}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5S21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialItem;