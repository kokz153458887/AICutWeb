/**
 * 我的页面
 * 提供用户相关功能的入口，包括视频切片等功能
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialSelectModal from '../../edit/components/meterialSelect/MaterialSelectModal';
import { MaterialModel } from '../../edit/api/types';
import { useAuth } from '../../user';
import './styles.css';

/**
 * 功能网格项数据
 */
const gridItems = [
  { id: 'video-slice', title: '视频切片', icon: '🎬', description: '解析和管理视频片段' },
  { id: 'material-library', title: '素材库', icon: '📂', description: '查看和管理素材库' },
  { id: 'feature-3', title: '功能3', icon: '📊', description: '开发中' },
  { id: 'feature-4', title: '功能4', icon: '🔧', description: '开发中' },
];

/**
 * 我的页面组件
 * 提供各种功能的入口
 */
const Mine: React.FC = () => {
  const navigate = useNavigate();
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  
  // 使用权限控制Hook
  const { user, isAuthenticated, logout, requireLogin } = useAuth();

  /**
   * 处理网格项点击
   */
  const handleGridItemClick = (itemId: string) => {
    // 检查登录状态
    if (!isAuthenticated) {
      console.log('[Mine] 用户未登录，要求登录');
      requireLogin();
      return;
    }

    if (itemId === 'video-slice') {
      navigate('/video-slice');
    } else if (itemId === 'material-library') {
      setShowMaterialModal(true);
    } else {
      // 其他功能暂时显示开发中
      console.log(`功能 ${itemId} 开发中`);
    }
  };

  /**
   * 处理素材库选择
   */
  const handleMaterialSelect = (material: MaterialModel) => {
    // 再次检查登录状态（虽然弹窗打开时已经检查过，但为了安全起见再次检查）
    if (!isAuthenticated) {
      console.log('[Mine] 用户未登录，关闭弹窗并要求登录');
      setShowMaterialModal(false);
      requireLogin();
      return;
    }

    setShowMaterialModal(false);
    // 跳转到素材库详情页
    navigate(`/material-library/${material.materialID}`);
  };

  /**
   * 处理素材库弹窗关闭
   */
  const handleMaterialModalClose = () => {
    setShowMaterialModal(false);
  };

  /**
   * 处理登录按钮点击
   */
  const handleLoginClick = () => {
    requireLogin();
  };

  /**
   * 处理注销按钮点击
   */
  const handleLogoutClick = () => {
    logout();
  };

  // 渲染主网格页面
  return (
    <div className="mine-page">
      <div className="mine-header">
        <h1 className="mine-title">我的</h1>
        <div className="mine-auth-section">
          {isAuthenticated ? (
            <div className="mine-user-info">
              <span className="mine-username">{user?.username}</span>
              <button className="mine-logout-btn" onClick={handleLogoutClick}>
                注销
              </button>
            </div>
          ) : (
            <button className="mine-login-btn" onClick={handleLoginClick}>
              登录
            </button>
          )}
        </div>
      </div>
      
      <div className="mine-content">
        <div className="function-grid">
          {gridItems.map((item) => (
            <div
              key={item.id}
              className={`grid-item ${!isAuthenticated ? 'grid-item-disabled' : ''}`}
              data-id={item.id}
              onClick={() => handleGridItemClick(item.id)}
            >
              <div className="item-icon">{item.icon}</div>
              <div className="item-title">{item.title}</div>
              <div className="item-description">
                {!isAuthenticated ? '需要登录后使用' : item.description}
              </div>
              {!isAuthenticated && (
                <div className="item-lock-overlay">
                  🔒
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 素材库选择弹窗 - 只有登录用户才能看到 */}
      {showMaterialModal && isAuthenticated && (
        <MaterialSelectModal
          onClose={handleMaterialModalClose}
          onSelect={handleMaterialSelect}
        />
      )}
    </div>
  );
};

export default Mine;