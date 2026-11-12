# Gateway API 接口对齐文档

## 概述
本文档记录了 Gateway 配置与后端微服务接口的对齐情况。

## Gateway 配置变更

### API 端点映射

| Gateway 路径 | 后端服务 | 后端路径 | 说明 |
|-------------|---------|---------|------|
| `/auth/*` | users (8001) | `/auth/*` | 公开接口：登录、注册、忘记密码 |
| `/user/*` | users (8001) | `/user/*` | 用户服务接口（需要 JWT） |
| `/attraction/*` | content (8004) | `/attraction/*` | 景点接口（需要 JWT） |
| `/destination/*` | content (8004) | `/destination/*` | 目的地接口（需要 JWT） |
| `/travel-note/*` | content (8004) | `/travel-note/*` | 游记接口（需要 JWT） |
| `/banner/*` | content (8004) | `/banner/*` | 轮播图接口（需要 JWT） |
| `/search/*` | content (8004) | `/search/*` | 搜索接口（需要 JWT） |
| `/home/*` | content (8004) | `/home/*` | 首页推荐接口（需要 JWT） |
| `/comment/*` | social (8005) | `/comment/*` | 评论接口（需要 JWT） |
| `/like/*` | social (8005) | `/like/*` | 点赞接口（需要 JWT） |
| `/collection/*` | social (8005) | `/collection/*` | 收藏接口（需要 JWT） |
| `/file/*` | file (8003) | `/file/*` | 文件服务接口（需要 JWT） |

### 管道配置

#### 1. 公开接口管道 (userPublicPipeline)
- **API 端点**: `/auth/*`
- **策略**: CORS → Proxy
- **目标服务**: userService (8001)
- **JWT 验证**: 不需要

#### 2. 用户服务管道 (userAuthPipeline)
- **API 端点**: `/user/*`
- **策略**: CORS → JWT → Log → Request Transformer → Proxy
- **目标服务**: userService (8001)
- **JWT 验证**: 需要

#### 3. 内容服务管道 (contentAuthPipeline)
- **API 端点**: 
  - `/attraction/*`
  - `/destination/*`
  - `/travel-note/*`
  - `/banner/*`
  - `/search/*`
  - `/home/*`
- **策略**: CORS → JWT → Log → Request Transformer → Proxy
- **目标服务**: contentService (8004)
- **JWT 验证**: 需要

#### 4. 社交服务管道 (socialAuthPipeline)
- **API 端点**:
  - `/comment/*`
  - `/like/*`
  - `/collection/*`
- **策略**: CORS → JWT → Log → Request Transformer → Proxy
- **目标服务**: socialService (8005)
- **JWT 验证**: 需要

#### 5. 文件服务管道 (fileAuthPipeline)
- **API 端点**: `/file/*`
- **策略**: CORS → JWT → Log → Request Transformer → Proxy
- **目标服务**: fileService (8003)
- **JWT 验证**: 需要

## 后端接口路径汇总

### Users 服务 (8001)
- `/auth/api/test` - 测试接口
- `/auth/api/login` - 用户登录
- `/auth/api/register` - 前台用户注册
- `/auth/api/forgot-password` - 忘记密码
- `/user/admin-api/create` - 创建管理员
- `/user/admin-api/batch-delete` - 批量删除用户
- `/user/api/list` - 查询用户列表
- `/user/api/info` - 查询用户详情资料
- `/user/api/update` - 更新用户资料
- `/user/api/update-status` - 更新用户状态
- `/user/api/upload-avatar` - 上传头像
- `/user/api/my-profile` - 获取当前用户个人资料详情
- `/user/api/my-travel-notes` - 获取当前用户发布的游记列表
- `/user/api/batch-info` - 批量获取用户信息
- `/user/api/reset-password` - 重置用户密码
- `/user/api/count` - 获取用户总数

### Content 服务 (8004)
#### Attraction (景点)
- `/attraction/api/create` - 创建景点
- `/attraction/api/delete` - 批量删除景点
- `/attraction/api/list` - 查询景点列表
- `/attraction/api/update` - 更新景点
- `/attraction/api/detail` - 获取景点详情

#### Destination (目的地)
- `/destination/api/create` - 创建目的地
- `/destination/api/delete` - 批量删除目的地
- `/destination/api/list` - 查询目的地列表
- `/destination/api/update` - 更新目的地
- `/destination/api/detail` - 获取目的地详情

#### Travel Note (游记)
- `/travel-note/api/create` - 创建游记
- `/travel-note/api/delete` - 批量删除游记
- `/travel-note/api/list` - 查询游记列表
- `/travel-note/api/update` - 更新游记
- `/travel-note/api/detail` - 获取游记详情
- `/travel-note/admin-api/audit` - 审核游记
- `/travel-note/admin-api/set-top` - 置顶/取消置顶游记
- `/travel-note/api/batch-detail` - 批量获取游记详情

#### Banner (轮播图)
- `/banner/admin-api/create` - 创建轮播图
- `/banner/admin-api/delete` - 批量删除轮播图
- `/banner/admin-api/list` - 查询轮播图列表
- `/banner/admin-api/update` - 更新轮播图
- `/banner/api/active` - 获取启用的轮播图列表

#### Search (搜索)
- `/search/api/search` - 统一搜索接口

#### Home (首页推荐)
- `/home/api/recommend` - 获取首页推荐内容
- `/home/api/hot-destinations` - 获取热门目的地排行

### Social 服务 (8005)
#### Comment (评论)
- `/comment/api/create` - 创建评论
- `/comment/api/delete` - 删除评论
- `/comment/api/list` - 查询评论列表
- `/comment/api/count` - 获取评论总数

#### Like (点赞)
- `/like/api/toggle` - 点赞/取消点赞
- `/like/api/status` - 检查点赞状态
- `/like/api/count` - 获取点赞数

#### Collection (收藏)
- `/collection/api/toggle` - 收藏/取消收藏
- `/collection/api/status` - 检查收藏状态
- `/collection/api/list` - 查询收藏列表

### File 服务 (8003)
- `/file/trip-api/upload-img` - 上传图片

## JWT 请求头转换

所有需要 JWT 验证的管道都会将 JWT payload 中的信息转换为请求头：

| 请求头 | 来源 | 说明 |
|-------|------|------|
| `X-User-Code` | `req.user.sub` | 用户 ID (ULID) |
| `X-User-Name` | `req.user.userName` | 用户名 |
| `X-User-Email` | `req.user.email` | 邮箱 |
| `X-User-NickName` | `req.user.nickName` | 昵称 |
| `X-User-Role` | `req.user.role` | 角色 |
| `X-User-Status` | `req.user.status` | 状态 |
| `X-Original-Token` | `req.headers.authorization` | 原始 JWT Token |

## 注意事项

1. **JWT 算法**: 使用 RS256 算法进行签名验证
2. **公开接口**: 只有 `/auth/*` 路径下的接口不需要 JWT 验证
3. **CORS 配置**: 允许所有来源 (`*`)，生产环境应限制具体域名
4. **服务端口**:
   - Gateway HTTP: 2001
   - Gateway Admin: 2002
   - Users: 8001
   - Notification: 8002
   - File: 8003
   - Content: 8004
   - Social: 8005

## 前端 API 调用示例

```typescript
// 登录（公开接口）
POST http://localhost:2001/auth/api/login

// 获取用户信息（需要 JWT）
GET http://localhost:2001/user/api/info?uid=xxx
Headers: Authorization: Bearer <token>

// 获取景点列表（需要 JWT）
GET http://localhost:2001/attraction/api/list?pageNum=1&pageSize=10
Headers: Authorization: Bearer <token>

// 点赞（需要 JWT）
POST http://localhost:2001/like/api/toggle
Headers: Authorization: Bearer <token>
Body: { "targetId": "xxx", "targetType": "travel-note" }
```
