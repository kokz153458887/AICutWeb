import * as React from 'react';
import './styles.css';

/**
 * 错误视图组件的属性接口
 */
interface ErrorViewProps {
  onRetry: () => void;
}

/**
 * 全局通用的错误视图组件
 * 展示错误信息和重试按钮
 */
const ErrorView: React.FC<ErrorViewProps> = ({ onRetry }) => {
  const handleRetry = React.useCallback(() => {
    onRetry();
  }, [onRetry]);

  return (
    <div className="error-view">
      <span className="error-text">加载失败</span>
      <button className="retry-button" onClick={handleRetry}>
        点击重试
      </button>
    </div>
  );
};

export default ErrorView;