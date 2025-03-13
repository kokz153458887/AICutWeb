export class HomeRoutes {
  constructor(db) {
    this.db = db;
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
      if (this.db.home?.getHomeData) {
        console.log('找到首页数据');
        res.jsonp(this.db.home.getHomeData);
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