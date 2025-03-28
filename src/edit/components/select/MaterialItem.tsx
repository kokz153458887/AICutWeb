/**
 * 素材项组件
 * 负责展示单个素材库的信息，包括封面图、名称、标签和素材数量
 */
import React from 'react';
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
  /**
   * 处理点击事件
   */
  const handleClick = () => {
    onClick(item);
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
      <img 
        className="material-cover" 
        src={item.coverUrl || 'https://via.placeholder.com/160x90'} 
        alt={item.name}
        loading="lazy"
      />
      
      {/* 选中标记 */}
      <div className="material-check">✓</div>
      
      {/* 素材信息 */}
      <div className="material-info">
        <div className="material-name">{item.name}</div>
        <div className="material-meta">
          {showCollectionTag && <div className="material-tag">合集</div>}
          <div className="material-count">{item.nums || 0}个素材</div>
        </div>
      </div>
    </div>
  );
};

export default MaterialItem;