# QMChatStudio

![QMChatStudio主页](/images/show.jpg)



QMChatStudio is a chat application based on OpenAI API and Ant Design X component library, providing streaming response conversation experience.

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
- 2025-02-23 加入了后端的用户模块，会话记录管理
- 2025-02-21 加入了前端会话历史聊天记录管理
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

# 修改 .env 文件 配置Key 、数据库与 代理URL（国内的话需要配置代理）

# 初始化数据库（创建表和默认用户）
npm run db:setup

# 或者单独运行
npm run db:migrate  # 只创建表
npm run db:seed    # 只创建默认用户
npm run db:rollback # 回滚（删除表）

# 运行后端
npm run dev
```

## ToDoList
| 功能 | 状态 |
|------|------|
| 用户后台管理系统 | □ |
| 用户权限管理 | □ |
| 用户数据统计面板 | □ |
| 接入支付 | □ |


## License

MIT License

Copyright (c) 20245

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


