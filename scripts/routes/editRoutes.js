/**
 * 编辑页路由处理类
 * 处理视频编辑相关的API请求
 */
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class EditRoutes {
  constructor(db) {
    // 保存初始数据库对象作为备份
    this.db = db;
    // 保存edit.json文件的完整路径
    this.editDataPath = join(__dirname, '../../mock/data/edit.json');
  }

  /**
   * 获取最新的编辑页配置数据
   * 每次调用时都会重新读取文件
   * @returns {object} 最新的编辑页配置数据
   */
  getLatestEditData() {
    try {
      console.log('[编辑配置] 尝试读取配置文件:', this.editDataPath);
      if (!fs.existsSync(this.editDataPath)) {
        console.error('[编辑配置] 错误: 未找到配置文件', this.editDataPath);
        throw new Error('配置文件不存在');
      }
      
      const jsonContent = fs.readFileSync(this.editDataPath, 'utf8');
      const data = JSON.parse(jsonContent);
      
      console.log('[编辑配置] 成功读取配置文件');
      return data.getEditConfig;
    } catch (error) {
      console.error('[编辑配置] 读取配置文件失败:', error.message);
      throw error; // 直接抛出错误，不生成默认配置
    }
  }

  /**
   * 获取最新的提交配置响应数据
   * 每次调用时都会重新读取文件
   * @returns {object} 最新的提交配置响应数据
   */
  getLatestSubmitData() {
    try {
      // 从文件系统直接读取最新的edit.json内容
      const data = JSON.parse(fs.readFileSync(this.editDataPath, 'utf8'));
      console.log('已重新读取edit.json文件的submitConfig部分');
      return data.submitConfig;
    } catch (error) {
      console.error('读取edit.json文件submitConfig部分失败:', error);
      // 如果读取失败，返回内存中的备份数据
      return this.db.edit?.submitConfig;
    }
  }

  /**
   * 注册编辑页路由
   * @param {Object} server - Express服务器实例
   */
  registerRoutes(server) {
    // 获取编辑页配置
    server.get('/api/edit/config', (req, res) => {
      console.log('获取编辑页配置请求:', req.query);
      
      try {
        // 获取styleId参数，如果不存在则使用默认风格
        const styleId = req.query.styleId || 'style_default';
        console.log(`请求的风格ID: ${styleId}`);
        
        // 从文件系统获取最新的编辑页配置数据
        const editData = this.getLatestEditData();
        
        if (editData) {
          console.log('找到编辑页配置数据，正在返回');
          res.jsonp(editData);
        } else {
          console.log('未找到编辑页配置数据，返回默认响应');
          throw new Error('未找到编辑页配置数据');
        }
      } catch (error) {
        console.error('处理获取编辑页配置请求时出错:', error.message, error.stack);
        res.status(500).jsonp({
          code: 500,
          message: '服务器内部错误: ' + error.message,
          data: null
        });
      }
    });

    // 提交视频编辑配置
    server.post('/api/edit/submit', (req, res) => {
      console.log('提交视频编辑配置请求:', JSON.stringify(req.body).substring(0, 200) + '...');
      
      try {
        // 从文件系统获取最新的提交配置响应数据
        const submitData = this.getLatestSubmitData();
        
        if (submitData) {
          console.log('找到提交配置响应数据');
          res.jsonp(submitData);
        } else {
          console.log('未找到提交配置响应数据，返回默认响应');
          // 返回默认生成的视频ID
          const videoId = 'video_' + Date.now().toString();
          console.log(`生成的视频ID: ${videoId}`);
          res.jsonp({
            code: 0,
            message: 'success',
            data: {
              videoId: videoId
            }
          });
        }
      } catch (error) {
        console.error('处理提交视频编辑配置请求时出错:', error.message, error.stack);
        res.status(500).jsonp({
          code: 500,
          message: '服务器内部错误: ' + error.message,
          data: null
        });
      }
    });
  }
} 