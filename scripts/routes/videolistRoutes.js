// VideoList路由处理类
import fs from 'fs';
import path from 'path';

export class VideoListRoutes {
  constructor(db) {
    this.db = db;
    this.dataPath = path.resolve('./mock/data/videolist.json');
  }

  // 读取最新的视频列表数据
  readLatestVideoListData() {
    return new Promise((resolve) => {
      try {
        if (fs.existsSync(this.dataPath)) {
          const data = fs.readFileSync(this.dataPath, 'utf8');
          const jsonData = JSON.parse(data);
          
          // 延迟一秒再返回
          setTimeout(() => {
            // 检查JSON结构，确保返回正确格式
            if (jsonData && jsonData.getVideoList) {
              resolve(jsonData.getVideoList);
            } else {
              console.warn('视频列表JSON文件格式不正确');
              resolve({ code: 200, message: 'success', data: { videolist: [] } });
            }
          }, 1000);
          
        } else {
          console.warn('视频列表JSON文件不存在:', this.dataPath);
          setTimeout(() => {
            resolve({ code: 200, message: 'success', data: { videolist: [] } });
          }, 1000);
        }
      } catch (error) {
        console.error('读取视频列表数据失败:', error);
        setTimeout(() => {
          resolve({ code: 200, message: 'success', data: { videolist: [] } });
        }, 1000);
      }
    });
  }

  // 注册所有路由处理函数
  registerRoutes(server) {
    // 获取视频列表
    server.get('/api/videolist', (req, res) => {
      this.getVideoList(req, res);
    });
    
    // 获取单个视频详情
    server.get('/api/videolist/:id', (req, res) => {
      this.getVideoDetail(req, res);
    });
    
    // 重新生成视频
    server.post('/api/videolist/regenerate', (req, res) => {
      this.regenerateVideo(req, res);
    });
  }

  // 获取视频列表
  async getVideoList(req, res) {
    try {
      console.log('获取视频列表');
      
      // 从JSON文件中读取最新数据
      const response = await this.readLatestVideoListData();
      const allVideos = response.data.videolist || [];
      
      // 构建响应 - 直接返回所有数据
      const responseData = {
        ...response,
        data: {
          videolist: allVideos,
          total: allVideos.length,
          hasMore: true
        }
      };
      
      console.log(`返回数据: 总共 ${allVideos.length} 条`);
      return res.status(200).json(responseData);
    } catch (error) {
      console.error('获取视频列表失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器错误',
        data: null
      });
    }
  }

  // 获取单个视频详情
  async getVideoDetail(req, res) {
    try {
      const { id } = req.params;
      console.log(`获取视频详情: ${id}`);
      
      // 从JSON文件中读取最新数据
      const videoListData = await this.readLatestVideoListData();
      const allVideos = videoListData.data.videolist;
      const video = allVideos.find(item => item.generateId === id);
      
      if (video) {
        return res.status(200).json({
          code: 200,
          message: 'success',
          data: video
        });
      }
      
      return res.status(404).json({
        code: 404,
        message: '未找到视频',
        data: null
      });
    } catch (error) {
      console.error('获取视频详情失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器错误',
        data: null
      });
    }
  }

  // 重新生成视频
  regenerateVideo(req, res) {
    try {
      const { generateId } = req.body;
      console.log(`重新生成视频: ${generateId}`);
      
      // 模拟处理成功
      return res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          regenerateId: 'regen_' + generateId,
          status: 'generating'
        }
      });
    } catch (error) {
      console.error('重新生成视频失败:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器错误',
        data: null
      });
    }
  }
} 