import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class HomeRoutes {
  constructor(db) {
    // 保存初始数据库对象作为备份
    this.db = db;
    // 保存home.json文件的完整路径
    this.homeDataPath = join(__dirname, '../../mock/data/home.json');
  }

  /**
   * 获取最新的首页数据
   * 每次调用时都会重新读取文件
   * @returns {object} 最新的首页数据
   */
  getLatestHomeData() {
    try {
      // 从文件系统直接读取最新的home.json内容
      const data = JSON.parse(fs.readFileSync(this.homeDataPath, 'utf8'));
      console.log('已重新读取home.json文件的最新内容');
      return data.getHomeData;
    } catch (error) {
      console.error('读取home.json文件失败:', error);
      // 如果读取失败，返回内存中的备份数据
      return this.db.home?.getHomeData;
    }
  }

  /**
   * 获取首页数据
   * @param {object} req - HTTP 请求对象，包含 query 参数
   * @param {object} res - HTTP 响应对象，用于返回 JSON 数据
   */
  getHomeData = (req, res) => {
    console.log('进入首页数据获取路由');
    console.log('请求参数:', req.query);

    try {
      // 获取最新数据而不是使用缓存
      const latestHomeData = this.getLatestHomeData();
      
      if (latestHomeData) {
        console.log('找到首页数据');
        res.jsonp(latestHomeData);
      } else {
        console.log('未找到首页数据');
        res.status(404).jsonp({
          status: 'error',
          msg: 'Home data not found'
        });
      }
    } catch (error) {
      console.error('处理首页数据请求时出错:', error);
      res.status(500).jsonp({
        status: 'error',
        msg: 'Internal server error'
      });
    }
  }

  /**
   * 注册路由
   * @param {object} server - json-server 路由对象
   */
  registerRoutes(server) {
    server.get('/api/home/getHomeData', this.getHomeData);
  }
} 