import * as React from 'react';
import { Suspense } from 'react';
import LoadingView from './LoadingView';

interface LazyRouteProps {
  importFn: () => Promise<{ default: React.ComponentType<any> }>;
  props?: any;
}

/**
 * 懒加载路由组件
 * 用于实现真正的按需加载，避免预加载不必要的资源
 */
const LazyRoute: React.FC<LazyRouteProps> = ({ importFn, props = {} }) => {
  const LazyComponent = React.useMemo(() => React.lazy(importFn), [importFn]);
  
  return (
    <Suspense fallback={<LoadingView />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export default LazyRoute; 