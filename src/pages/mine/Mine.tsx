/**
 * 我的页面
 * 提供用户相关功能的入口，包括视频切片等功能
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

/**
 * 功能网格项数据
 */
const gridItems = [
  { id: 'video-slice', title: '视频切片', icon: '🎬', description: '解析和管理视频片段' },
  { id: 'feature-2', title: '功能2', icon: '⚙️', description: '开发中' },
  { id: 'feature-3', title: '功能3', icon: '📊', description: '开发中' },
  { id: 'feature-4', title: '功能4', icon: '🔧', description: '开发中' },
];

/**
 * 我的页面组件
 * 提供各种功能的入口
 */
const Mine: React.FC = () => {
  const navigate = useNavigate();

  /**
   * 处理网格项点击
   */
  const handleGridItemClick = (itemId: string) => {
    if (itemId === 'video-slice') {
      navigate('/video-slice');
    } else {
      // 其他功能暂时显示开发中
      console.log(`功能 ${itemId} 开发中`);
    }
  };

  // 渲染主网格页面
  return (
    <div className="mine-page">
      <div className="mine-header">
        <h1 className="mine-title">我的</h1>
      </div>
      
      <div className="mine-content">
        <div className="function-grid">
          {gridItems.map((item) => (
            <div
              key={item.id}
              className="grid-item"
              data-id={item.id}
              onClick={() => handleGridItemClick(item.id)}
            >
              <div className="item-icon">{item.icon}</div>
              <div className="item-title">{item.title}</div>
              <div className="item-description">{item.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Mine;