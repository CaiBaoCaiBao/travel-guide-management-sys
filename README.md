# 基于微服务的旅游攻略系统

面向旅游爱好者的内容与互动平台：浏览目的地与景点、创作游记、评论点赞收藏；同时提供运营管理后台，统一维护用户与内容。

**作者：** 刘俊涛  
**邮箱：** 13503089560@163.com

---

## 功能特性

### 用户端
- 目的地、景点浏览与详情
- 游记浏览、创作、草稿与发布
- 评论、点赞、收藏
- 个人主页与资料设置
- 密码 / 邮箱验证码登录，注册与找回密码

### 管理端
- 用户管理
- 目的地、景点、游记、评论管理
- 轮播图配置
- 数据统计与仪表盘

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Spring Boot 3.3、Spring Cloud Alibaba、Nacos、OpenFeign、MyBatis-Plus |
| 网关 | Express Gateway |
| 数据 | PostgreSQL、Redis |
| 其他 | JWT（RS256）、JavaMail（验证码邮件）、七牛云（图片上传） |
| 前端 | Next.js 16、React 19、TypeScript、Shadcn UI、Axios |

---

## 架构概览

前后端分离。C 端与管理端请求统一进入网关，由网关完成路由转发与 JWT 鉴权，再代理到各微服务。

```
user / admin  →  gateway  →  users / notification / file / content / social
```

| 服务 | 端口 | 说明 |
|------|------|------|
| gateway | 2001 | API 网关 |
| users | 8001 | 用户与认证 |
| notification | 8002 | 邮件验证码 |
| file | 8003 | 文件上传 |
| content | 8004 | 目的地、景点、游记、搜索等 |
| social | 8005 | 评论、点赞、收藏 |
| common | — | 公共模块（统一响应、JWT、Feign Client 等） |

---

## 项目结构

```
├── user/        # C 端（Next.js，:3000）
├── admin/       # 管理端（Next.js，:4000）
├── gateway/     # 网关（Express Gateway，:2001）
└── parent/      # 后端微服务父工程
    ├── common/
    ├── users/
    ├── notification/
    ├── file/
    ├── content/
    └── social/
```

---

## 快速开始

### 环境要求

- JDK 17+、Maven 3.8+
- Node.js 18+、pnpm
- PostgreSQL、Redis、Nacos
- SMTP 邮箱、七牛云（发信与上传按需配置）

### 启动后端

1. 启动 PostgreSQL、Redis、Nacos（默认 `8848`）
2. 配置各服务数据源、邮件、OSS 等（请使用本地私密配置）
3. 在 `parent/` 下构建并依次启动：`users` → `notification` → `file` → `content` → `social`

### 启动网关

```bash
cd gateway
pnpm install
pnpm start:env
```

### 启动前端

```bash
# C 端 http://localhost:3000
cd user && pnpm install && pnpm dev

# 管理端 http://localhost:4000
cd admin && pnpm install && pnpm dev
```

前端通过环境变量 `NEXT_PUBLIC_URL` 指向网关（默认 `http://localhost:2001`）。

---

## License

MIT License © 2026 JuntL
