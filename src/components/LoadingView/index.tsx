import * as React from 'react';
import './styles.css';

/**
 * 全局通用的加载中视图组件
 * 展示一个居中的加载动画和提示文字
 */
const LoadingView: React.FC = () => {
  return (
    <div className="loading-view">
      <div className="loading-spinner"></div>
      <span className="loading-text">加载中</span>
    </div>
  );
};

export default LoadingView;