/**
 * 视频切片筛选标签组件
 * 提供不同状态的筛选功能：待录入、解析失败、已录入、全部
 */
import React from 'react';
import { VideoSliceFilter, VideoSliceFilterLabels } from '../../types';
import './styles.css';

interface FilterTabsProps {
  activeFilter: VideoSliceFilter;
  onFilterChange: (filter: VideoSliceFilter) => void;
  counts?: Partial<Record<VideoSliceFilter, number>>; // 可选的计数显示
}

/**
 * 筛选标签组件
 * 允许用户在不同的视频切片状态之间进行筛选
 */
const FilterTabs: React.FC<FilterTabsProps> = ({ 
  activeFilter, 
  onFilterChange,
  counts = {}
}) => {
  // 筛选选项顺序
  const filterOptions = [
    VideoSliceFilter.PENDING,
    VideoSliceFilter.PARSE_FAILED,
    VideoSliceFilter.RECORDED,
    VideoSliceFilter.ALL
  ];

  /**
   * 处理筛选选项点击
   */
  const handleFilterClick = (filter: VideoSliceFilter) => {
    if (filter !== activeFilter) {
      onFilterChange(filter);
    }
  };

  /**
   * 渲染单个筛选标签
   */
  const renderFilterTab = (filter: VideoSliceFilter) => {
    const isActive = filter === activeFilter;
    const count = counts[filter];
    const label = VideoSliceFilterLabels[filter];

    return (
      <button
        key={filter}
        className={`filter-tab ${isActive ? 'active' : ''}`}
        onClick={() => handleFilterClick(filter)}
      >
        <span className="filter-label">{label}</span>
        {typeof count === 'number' && (
          <span className="filter-count">({count})</span>
        )}
      </button>
    );
  };

  return (
    <div className="filter-tabs">
      <div className="filter-tabs-container">
        {filterOptions.map(renderFilterTab)}
      </div>
    </div>
  );
};

export default FilterTabs; 