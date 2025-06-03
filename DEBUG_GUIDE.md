# React 项目调试指南

## 🚀 调试环境配置

本项目已经配置好了完整的调试环境，支持在 VS Code 中进行断点调试。

### 配置文件说明

1. **`.vscode/launch.json`** - VS Code 调试配置
   - `Debug React App (Chrome)` - 启动 Chrome 并自动连接调试
   - `Attach to Chrome` - 连接到已运行的 Chrome 实例

2. **`vite.config.ts`** - 已启用开发环境 sourcemap
   - `sourcemap: true` - 构建时生成 sourcemap
   - `devSourcemap: true` - CSS sourcemap
   - `esbuild.sourcemap: true` - ESBuild sourcemap

## 🔧 调试步骤

### 方法一：使用 VS Code 调试

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **在 VS Code 中设置断点**
   - 打开任意 `.tsx` 或 `.ts` 文件
   - 点击行号左侧设置断点（红色圆点）

3. **启动调试**
   - 按 `F5` 或点击调试面板的"启动调试"
   - 选择 "Debug React App (Chrome)" 配置
   - Chrome 浏览器会自动打开并连接到调试器

4. **开始调试**
   - 浏览器会自动打开 `http://localhost:5173`
   - 当代码执行到断点时会自动暂停
   - 可以查看变量值、调用堆栈等

### 方法二：浏览器调试

1. 启动开发服务器后，打开 Chrome
2. 访问 `http://localhost:5173`
3. 按 `F12` 打开开发者工具
4. 在 Sources 面板中找到源码文件
5. 直接在源码上设置断点

## 🔍 调试功能测试

项目中已在 `src/App.tsx` 中添加了调试测试代码：

```typescript
// 添加调试断点测试点
debugger; // 这里会触发断点，方便测试调试功能

// 测试调试日志
console.group('🔍 调试信息');
console.log('当前路由信息：', location);
console.log('当前时间戳：', new Date().toISOString());
console.groupEnd();
```

当你启动调试时，会在这些地方自动暂停，方便验证调试功能是否正常工作。

## 📝 调试技巧

1. **条件断点**：右键断点可以设置条件
2. **日志断点**：设置断点时选择"日志点"而不是"断点"
3. **变量监视**：在调试面板添加要监视的变量
4. **调用堆栈**：查看函数调用链
5. **热重载**：修改代码后会自动刷新，断点依然有效

## 🎯 常见问题

1. **断点不生效**
   - 确保 sourcemap 已启用
   - 检查文件路径是否正确
   - 重新启动调试会话

2. **无法连接调试器**
   - 确保开发服务器正在运行
   - 检查端口号是否为 5173
   - 关闭其他 Chrome 调试会话

3. **性能问题**
   - 调试模式会影响性能，生产环境请关闭 sourcemap
   - 避免在循环中设置过多断点

## 🎉 开始调试

现在你可以：
1. 运行 `npm run dev` 启动开发服务器
2. 在 VS Code 中按 `F5` 开始调试
3. 在代码中设置断点
4. 享受高效的调试体验！ 