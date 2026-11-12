# 基于微服务的旅游攻略系统的设计与实现

## 作者

**作者：** 刘俊涛

**联系邮箱：** 13503089560@163.com

---

## 项目简介

本项目是一个基于微服务架构的旅游攻略系统，为用户提供目的地与景点查询、游记分享、评论点赞收藏等互动能力，并为管理员提供内容与用户运营后台。系统采用前后端分离：后端为 Spring Boot + Spring Cloud Alibaba 微服务，统一经 Express Gateway 对外；前端分为 C 端（`user`）与管理端（`admin`），均基于 Next.js。

---

## 技术架构

### 后端

| 类别 | 技术 |
|------|------|
| 框架 | Spring Boot 3.3 |
| 微服务 | Spring Cloud / Spring Cloud Alibaba |
| 注册与配置 | Nacos |
| 服务调用 | OpenFeign |
| 网关 | Express Gateway |
| 数据库 | PostgreSQL |
| ORM | MyBatis-Plus |
| 缓存 | Redis |
| 消息队列 | RabbitMQ（通知服务） |
| 对象存储 | 七牛云 OSS（文件服务） |
| 认证授权 | JWT（RS256） |

### 前端

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 / React 19 |
| UI | Shadcn UI / Tailwind CSS |
| 表单与校验 | TanStack Form / Zod |
| HTTP | Axios |
| 状态（C 端） | Zustand / SWR |

---

## 系统架构

```
┌────────────┐   ┌────────────┐
│  user(:3000)│   │ admin(:4000)│
└──────┬─────┘   └──────┬─────┘
       │                │
       └────────┬───────┘
                ▼
        gateway(:2001)
                │
    ┌───────────┼───────────┬────────────┬────────────┐
    ▼           ▼           ▼            ▼            ▼
 users(:8001) notification  file(:8003) content(:8004) social(:8005)
                (:8002)
```

请求经网关做 CORS、公开/鉴权分流与 JWT 校验，再代理到各微服务；鉴权通过后由网关注入 `X-User-*` 请求头供下游识别用户身份。

---

## 项目结构

```
travel-guide-management-sys/
├── admin/                 # 管理后台（Next.js，开发端口 4000）
├── user/                  # C 端用户站（Next.js，开发端口 3000）
├── gateway/               # Express Gateway（HTTP 2001 / Admin 2002）
├── parent/                # 后端 Maven 父工程
│   ├── common/            # 公共模块（Result、JWT、Feign Client、异常处理等）
│   ├── users/             # 用户服务 :8001
│   ├── notification/      # 通知服务 :8002（邮件 / RabbitMQ）
│   ├── file/              # 文件服务 :8003
│   ├── content/           # 内容服务 :8004（目的地、景点、游记、搜索等）
│   └── social/            # 社交服务 :8005（评论、点赞、收藏）
├── LICENSE
└── README.md
```

---

## 服务划分

### users（用户服务）

**职责：** 注册登录、JWT 签发、个人资料与用户信息管理。

**主要能力：**
- 注册 / 登录 / 忘记密码
- Access Token + Refresh Token
- 用户信息查询与资料更新
- 邮箱 OTP 触发（协同 notification）

**相关表：** `users`、`user_profile`

---

### notification（通知服务）

**职责：** 异步通知与邮件发送。

**主要能力：**
- 基于 RabbitMQ 的消息消费
- SMTP 邮件发送（如验证码）

---

### file（文件服务）

**职责：** 文件上传与对象存储对接。

**主要能力：**
- 图片等资源上传
- 对接七牛云 OSS

---

### content（内容服务）

**职责：** 旅游内容、游记、搜索、首页推荐与统计。

**主要能力：**
- 目的地 / 景点 / 游玩项目 / 票种管理
- 开放时间规则与例外
- 标签体系
- 游记发布、草稿、列表与详情
- 搜索、搜索日志、首页推荐
- 轮播图、数据统计
- Redis 缓存

**相关表：** `destination`、`attraction`、`play_item`、`ticket`、`open_time_rule`、`open_hours_exception`、`tags`、`tag_type`、`destination_tags`、`attraction_tags`、`travel_note`、`search_log`、`t_banner` 等

---

### social（社交服务）

**职责：** 用户与内容的互动。

**主要能力：**
- 评论 / 回复 / 删除
- 点赞（toggle）
- 收藏

**相关表：** `comment`、`like_record`、`collection`

---

### common（公共模块）

**职责：** 各服务共享的基础能力（非独立业务入口）。

**主要内容：**
- 统一响应 `Result`、全局异常处理
- JWT / UserContext
- OpenFeign Client（Users / Content / Social / File / Notification）
- Redis、MyBatis、Jackson 等公共配置

---

### gateway（API 网关）

**职责：** 统一入口、路由代理与 JWT 校验。

**主要能力：**
- 公开接口直通（登录注册、内容浏览、部分社交查询等）
- 受保护接口 JWT（RS256）校验
- 将用户声明写入 `X-User-Uuid` 等请求头后转发下游

---

## 前端应用

### user（C 端）

面向普通用户，主要页面包括：
- 首页推荐
- 目的地 / 景点浏览与详情
- 游记列表、详情、创建与编辑
- 收藏
- 个人主页与资料设置
- 登录 / 注册 / 忘记密码

开发命令：`pnpm dev`（默认 `http://localhost:3000`）

API 基址通过 `NEXT_PUBLIC_URL` 指向网关（默认 `http://localhost:2001`）。

---

### admin（管理端）

面向运营/管理员，主要功能包括：
- 仪表盘
- 用户管理
- 游记 / 评论管理
- 目的地 / 景点管理
- 轮播图管理
- 数据统计

开发命令：`pnpm dev`（`http://localhost:4000`）

API 基址同样通过 `NEXT_PUBLIC_URL` 指向网关。

---

## 认证授权

1. 用户在 `users` 服务登录成功后签发 JWT（RS256）。
2. 客户端后续请求在 `Authorization` 头携带令牌。
3. `gateway` 对受保护路由校验令牌有效性与算法。
4. 校验通过后，网关注入用户身份头，下游服务按需读取。

---

## 快速开始

### 环境要求

- JDK 17+
- Maven 3.8+
- Node.js 18+ / pnpm
- PostgreSQL（库名示例：`trip`）
- Redis
- RabbitMQ
- Nacos（`localhost:8848`）

### 启动顺序建议

1. 启动 PostgreSQL、Redis、RabbitMQ、Nacos。
2. 准备数据库并配置各服务 `application.yml`（数据源、邮件、OSS 等请使用本地私密配置，勿提交密钥）。
3. 在 `parent/` 下构建并启动微服务：`users` → `notification` → `file` → `content` → `social`。
4. 在 `gateway/` 配置 `.env`（至少 `HTTP_PORT`、`ADMIN_PORT`）后执行：

```bash
cd gateway
pnpm install
pnpm start:env
```

5. 启动前端：

```bash
# C 端
cd user
pnpm install
pnpm dev

# 管理端
cd admin
pnpm install
pnpm dev
```

### 默认端口一览

| 组件 | 端口 |
|------|------|
| user 前端 | 3000 |
| admin 前端 | 4000 |
| gateway HTTP | 2001 |
| gateway Admin | 2002 |
| users | 8001 |
| notification | 8002 |
| file | 8003 |
| content | 8004 |
| social | 8005 |
| Nacos | 8848 |

---

## License

MIT License © 2026 JuntL
