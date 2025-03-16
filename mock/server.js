const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

// 创建Express应用
const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 模拟数据
const generateMockData = () => {
  const topbarItems = [
    { id: 'recommend', text: '推荐' },
    { id: 'hot', text: '热门' },
    { id: 'video', text: '视频' }
  ];
  
  // 生成模拟内容项
  const generateContentItems = (count, startIndex = 1) => {
    return Array.from({ length: count }, (_, i) => {
      const index = startIndex + i;
      return {
        styleId: `item${index}`,
        styleName: `内容项 ${index}`,
        text: `这是第 ${index} 个内容项的描述文本，可能会很长很长很长很长很长很长很长很长很长很长`,
        cover: `https://picsum.photos/300/400?random=${index}`,
        stars: Math.floor(Math.random() * 50000),
        ratio: Math.random() * 0.5 + 1.2, // 1.2 - 1.7的随机比例
      };
    });
  };
  
  return {
    topbarItems,
    contentMap: {
      recommend: generateContentItems(100),
      hot: generateContentItems(100),
      video: generateContentItems(100)
    }
  };
};

const mockData = generateMockData();

// 模拟API延迟
const simulateDelay = (req, res, next) => {
  const delay = Math.random() * 500 + 200; // 200-700ms的随机延迟
  setTimeout(next, delay);
};

// 使用延迟中间件
app.use(simulateDelay);

// 获取首页数据的API
app.get('/api/home', (req, res) => {
  const { tab = 'recommend', pageNum = 1, pageSize = 8 } = req.query;
  
  // 获取指定标签的内容
  const allContent = mockData.contentMap[tab] || [];
  
  // 分页处理
  const start = (pageNum - 1) * pageSize;
  const end = start + parseInt(pageSize);
  const content = allContent.slice(start, end);
  
  // 构建响应数据
  const response = {
    code: 0,
    message: 'success',
    data: {
      topbarItems: mockData.topbarItems,
      content,
      pages: {
        total: allContent.length,
        pageNum: parseInt(pageNum),
        pageSize: parseInt(pageSize),
        hasMore: end < allContent.length
      }
    }
  };
  
  // 返回响应
  res.json(response);
});

// 兼容旧版API路径
app.get('/api/home/getHomeData', (req, res) => {
  // 重定向到新的API路径
  req.url = '/api/home';
  app.handle(req, res);
});

// 处理视频详情请求
app.get('/api/video/getVideoDetail', (req, res) => {
  try {
    const videoId = req.query.videoId;
    console.log(`[Mock Server] 获取视频详情: videoId=${videoId}`);
    
    // 读取视频详情数据
    const videoData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/video.json'), 'utf8'));
    
    // 返回数据
    res.json(videoData);
  } catch (error) {
    console.error('[Mock Server] 获取视频详情失败:', error);
    res.status(500).json({
      status: 'error',
      msg: '服务器内部错误',
      data: null
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Mock服务器运行在 http://localhost:${PORT}`);
}); 