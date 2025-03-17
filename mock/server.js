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

// 模拟API延迟
const simulateDelay = (req, res, next) => {
  const delay = Math.random() * 500 + 200; // 200-700ms的随机延迟
  setTimeout(next, delay);
};

// 使用延迟中间件
app.use(simulateDelay);

// 获取首页数据的API
app.get('/api/home', (req, res) => {
  try {
    const { tab = 'recommend', pageNum = 1, pageSize = 8 } = req.query;
    
    // 读取home.json文件中的模拟数据
    const homeData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/home.json'), 'utf8'));
    
    // 从home.json中提取数据
    const topbarItems = homeData.getHomeData.data.topbar;
    const allContent = homeData.getHomeData.data.content;
    
    // 分页处理
    const start = (pageNum - 1) * pageSize;
    const end = start + parseInt(pageSize);
    const content = allContent.slice(start, end);
    
    // 构建响应数据
    const response = {
      code: 0,
      message: 'success',
      data: {
        topbarItems: topbarItems,
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
  } catch (error) {
    console.error('[Mock Server] 获取首页数据失败:', error);
    res.status(500).json({
      code: -1,
      message: '服务器内部错误',
      data: null
    });
  }
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

// 获取编辑页配置
app.get('/api/edit/config', (req, res) => {
  try {
    const styleId = req.query.styleId;
    console.log(`[Mock Server] 获取编辑页配置: styleId=${styleId}`);
    
    // 读取编辑页配置数据
    const editConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/edit.json'), 'utf8'));
    
    // 如果指定了styleId，可以根据styleId调整返回数据
    if (styleId) {
      // 从styleList中查找匹配的风格
      const selectedStyle = editConfig.data.styleList.find(style => style.id === styleId);
      if (selectedStyle) {
        // 将选中的风格ID赋值给当前配置
        editConfig.data.config.style.videoShowRatio.cut_style = selectedStyle.name;
      }
    }
    
    // 返回数据
    res.json(editConfig);
  } catch (error) {
    console.error('[Mock Server] 获取编辑页配置失败:', error);
    res.status(500).json({
      code: -1,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 提交编辑配置
app.post('/api/edit/submit', (req, res) => {
  try {
    const config = req.body;
    console.log('[Mock Server] 提交编辑配置:', JSON.stringify(config).substring(0, 100) + '...');
    
    // 模拟提交成功
    res.json({
      code: 0,
      message: 'success',
      data: {
        videoId: 'video_' + Date.now()  // 生成一个随机视频ID
      }
    });
  } catch (error) {
    console.error('[Mock Server] 提交编辑配置失败:', error);
    res.status(500).json({
      code: -1,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Mock服务器运行在 http://localhost:${PORT}`);
}); 