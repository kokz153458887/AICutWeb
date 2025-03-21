# AICutWeb

一个基于React + TypeScript + Vite构建的视频编辑Web应用。

## 项目概述

本项目是一个专业的视频编辑Web应用，提供视频剪辑、编辑和管理功能。主要功能模块包括：

### 首页视频推荐
- 多标签页布局：支持推荐、热门、视频等多个分类
- 瀑布流展示：采用响应式布局，支持不同视频比例（16:9、4:3、1:1）
- 视频预览：展示封面、标题、点赞数和风格标签

### 视频播放
- 多格式支持：适配16:9、4:3、1:1等多种视频比例
- 智能封面：支持自动切换视频封面和播放状态
- 交互功能：支持点赞、分享、关注和"做同款"等社交操作

### 视频编辑
- 文案配置：支持标题和正文编辑，可自动生成标题
- 音频处理：支持配音选择、背景音乐添加和音量调节
- 视觉定制：提供背景图片选择、素材预览和视频比例设置
- 智能生成：支持设置备用视频数量，确保生成效果

### 视频管理
- 列表展示：支持视频批量预览和状态查看
- 视频操作：提供发布、下载、重新生成等功能
- 进度追踪：实时显示视频生成状态和创建时间

## 技术栈

- 前端框架：React 18
- 开发语言：TypeScript
- 构建工具：Vite
- 代码规范：ESLint

## 项目结构

```
src/
  ├── components/     # 公共组件
  ├── config/         # 项目配置
  ├── detail/         # 视频详情页
  ├── edit/           # 视频编辑页
  ├── hooks/          # 自定义Hooks
  ├── operate/        # 操作相关
  ├── pages/          # 页面组件
  ├── types/          # TypeScript类型定义
  ├── utils/          # 工具函数
  └── videolist/      # 视频列表页
```

## 开发指南

### 环境准备

- Node.js >= 16
- npm >= 8

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

## ESLint配置

如果你正在开发生产应用，我们建议更新配置以启用类型感知的lint规则：

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

你还可以安装[eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x)和[eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom)来获取React特定的lint规则：

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
