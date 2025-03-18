/**
 * 加载底部组件
 * 用于显示加载状态或加载失败的提示
 */
import React from 'react';
import '../styles/VideoList.css';

interface LoadingFooterProps {
  isLoading: boolean;
  error: boolean;
  onRetry: () => void;
}

/**
 * 加载底部组件
 */
const LoadingFooter: React.FC<LoadingFooterProps> = ({ isLoading, error, onRetry }) => {
  if (isLoading) {
    return (
      <div className="list-loading-footer">
        <div className="loading-spinner loading-spinner-small"></div>
        <span>加载中...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="list-error-footer" onClick={onRetry}>
        <span>加载失败，请重试</span>
      </div>
    );
  }
  
  return null;
};

export default LoadingFooter; 