import * as React from 'react';
import { useHomeData } from './useHomeData';
import './Home.css';

const Home: React.FC = () => {
  const { homeData, loading, error } = useHomeData();

  return (
    <div className="home-container">
      {loading && <p className="loading-text">加载中...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && homeData && homeData.content && homeData.content.length > 0 ? (
        <p className="content-text">{homeData.content[0].text}</p>
      ) : null}
    </div>
  );
};

export default Home;