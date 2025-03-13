import * as React from 'react';

const Home: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100%' // 使用百分比高度，因为父容器已经计算好了安全区域
    }}>
      <h2 style={{ color: '#000000' }}>首页正在开发中</h2>
    </div>
  );
};

export default Home;