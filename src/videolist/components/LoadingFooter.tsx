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
  console.log(`LoadingFooter 渲染: isLoading=${isLoading}, error=${error}`);
  
  if (isLoading) {
    console.log('LoadingFooter 显示加载中状态');
    return (
      <div className="list-loading-footer">
        <div className="loading-spinner loading-spinner-small"></div>
        <span>加载中...</span>
      </div>
    );
  }
  
  if (error) {
    console.log('LoadingFooter 显示错误状态');
    const handleRetryClick = (e: React.MouseEvent) => {
      console.log('LoadingFooter 错误重试按钮被点击');
      e.preventDefault();
      e.stopPropagation();
      onRetry();
    };
    
    return (
      <div 
        className="list-error-footer" 
        onClick={handleRetryClick}
        role="button"
        aria-label="重试加载"
        tabIndex={0}
      >
        <span className="retry-icon">↻</span>
        <span>加载失败，点击重试</span>
      </div>
    );
  }
  
  console.log('LoadingFooter 返回null (既不是加载中也不是错误状态)');
  return null;
};

export default LoadingFooter; 