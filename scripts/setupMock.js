// 修改为 ESM 语法，与 package.json 中的 "type": "module" 保持一致
import jsonServer from 'json-server';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { HomeRoutes } from './routes/homeRoutes.js';
import { EditRoutes } from './routes/editRoutes.js';
import { MOCK_SERVER } from './config.js';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = jsonServer.create();
const mockDir = join(__dirname, '../mock');
const dataDir = join(mockDir, 'data');
const publicDir = join(__dirname, '../public');

// 合并所有数据文件
const db = {};
fs.readdirSync(dataDir).forEach(file => {
  if (file.endsWith('.json')) {
    const data = JSON.parse(fs.readFileSync(join(dataDir, file)));
    const key = file.replace('.json', '');
    db[key] = data;
  }
});

console.log('加载的数据库内容:', JSON.stringify(db, null, 2));

const router = jsonServer.router(db);
const middlewares = jsonServer.defaults();

// 添加禁用缓存的中间件（放在最前面）
server.use((req, res, next) => {
  // 设置响应头，禁用所有缓存
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  res.header('ETag', Date.now().toString()); // 每次请求生成不同的ETag
  next();
});

// 添加请求日志中间件
server.use((req, res, next) => {
  console.log('收到请求:', {
    method: req.method,
    url: req.url,
    query: req.query,
    body: req.body
  });
  next();
});

// 添加延迟模拟真实网络请求
server.use((req, res, next) => {
  setTimeout(next, 300); // 减少延迟时间，方便测试
});

server.use(middlewares);

// 提供静态资源
server.use('/data', express.static(join(publicDir, 'data')));
console.log('提供静态资源目录:', join(publicDir, 'data'));

// 读取路由配置
const routesPath = join(mockDir, 'routes.json');
const routes = JSON.parse(fs.readFileSync(routesPath, 'utf-8'));

// 使用 HomeRoutes 类处理路由
const homeRoutes = new HomeRoutes(db);
homeRoutes.registerRoutes(server);

// 使用 EditRoutes 类处理编辑页路由
const editRoutes = new EditRoutes(db);
editRoutes.registerRoutes(server);

server.use(jsonServer.rewriter(routes));
server.use(router);

server.listen(MOCK_SERVER.PORT, () => {
  console.log(`Mock Server is running on http://${MOCK_SERVER.HOST}:${MOCK_SERVER.PORT}`);
  console.log('路由配置:', routes);
});