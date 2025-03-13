import * as React from 'react';

const Mine: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100%' // 使用百分比高度，因为父容器已经计算好了安全区域
    }}>
      <h2>我的正在开发中</h2>
    </div>
  );
};

export default Mine;