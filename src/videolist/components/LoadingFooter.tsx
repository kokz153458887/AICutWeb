/**
 * 加载底部组件
 * 用于显示加载状态或加载失败的提示
 */
import React from 'react';
import '../styles/VideoList.css';

interface LoadingFooterProps {
  isLoading: boolean;
  error: boolean;
  onRetry?: () => void;
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
        <div className="loading-spinner-small"></div>
        <span>加载中...</span>
      </div>
    );
  }
  
  if (error) {
    console.log('LoadingFooter 显示错误状态');
    return (
      <div 
        className="list-error-footer"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRetry?.();
        }}
        role="button"
        aria-label="重试加载"
      >
        <span>加载失败，点击重试</span>
        <svg className="retry-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  }
  
  // 当既不是加载中也不是错误状态时，显示没有更多数据的提示
  console.log('LoadingFooter 显示没有更多数据提示');
  return (
    <div className="list-no-more-footer">
      <span>没有更多数据了</span>
    </div>
  );
};

export default React.memo(LoadingFooter); 