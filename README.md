# QMChatStudio

![QMChatStudio主页](/images/show.jpg)

这是一个基于 OpenAI API 与 Ant Design X 的组件库的的聊天应用 ,提供了流式响应的对话体验。

## 技术栈

### 前端
- React 
- TypeScript
- Redux (状态管理)
- React Router (路由)
- Ant Design X (UI组件库)
- CSS Modules (样式隔离)

### 后端
- Node.js
- Express
- OpenAI API

## 功能特点

- 基于 OpenAI API 的智能对话
- 流式响应,实时显示 AI 回复
- 简洁美观的聊天界面
- 支持多轮对话

## 更新记录
- 2025-02-20 优化了前端的布局，将页面进行了组件化封装，加入了暗夜模式

## 运行

前端运行方法(3000端口)
```bash
cd frontend
# 安装依赖
npm install

# 运行前端
npm start
```

后端运行方法(3001端口)
```bash
cd backend
# 安装依赖
npm install

# 创建 .env 文件
cp .env_template .env

# 修改 .env 文件 配置Key 与 代理URL（国内的话需要配置代理）

# 运行后端
npm run dev
```

## 注意

- 后端接口实际上只调用了一个 `/api/chat` 接口,并且这个接口实际上只做了一件事,就是调用 OpenAI API 的 `chat.completions` 接口,并返回流式响应。

