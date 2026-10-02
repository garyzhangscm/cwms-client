# CWMS / MES Web — V19.2

CWMS / MES 的网页前端，覆盖库存、生产工单、仓库布局、入库、出库和生产看板等业务。
`V19.2` 基于 `v19.1.64` 开发，重点改善界面、操作体验和前端部署方式。

## V19.2 的主要改动

- **整体外观**：苹果风格的布局与字体，清晰的表格、卡片和菜单层级。
- **主题切换**：支持浅色与深色模式，浏览器记住用户的主题选择。
- **菜单与页面**：优化子菜单缩进和长名称显示，补齐 Dashboard 与账户页面。
- **生产看板**：产线改用圆角卡片，突出工单、物料和数量；支持长编号换行、窄屏及多工单显示。
- **工单明细**：按 Work Order Line Number 自然升序排列；隐藏 Spare Part Maintenance 入口。
- **配置页面**：增加 Integration Settings 和库存交接地点配置，改善库存调整阈值表单布局。
- **容器部署**：使用多阶段构建，把生产前端与 Nginx 打包成独立 Docker 镜像。

## 环境与发布状态

| 环境 | 入口 | 用途 |
| --- | --- | --- |
| 开发 / 测试 | [10.0.202.70:4200](http://10.0.202.70:4200/#/passport/login) | 验证 V19.2 的持续改动 |
| Colton 正式网站 | [10.0.10.159:31252](http://10.0.10.159:31252/#/passport/login) | 已验收版本的部署入口 |
| Docker Hub | [brianwang1912/mes-web](https://hub.docker.com/r/brianwang1912/mes-web/tags) | 发布前端镜像 |

这些网站地址需要内网访问。

截至 **2026-10-02**，Colton 部署的镜像为 `brianwang1912/mes-web:v19.2-5c4b3b1`，
对应前端源码提交 `5c4b3b1`。生产看板外观优化提交 `6bca0de` 已在测试环境生效，尚未发布到 Colton。
推送代码到 GitHub 不会自动更新正式网站。

**测试环境目前使用 Colton 的正式后端和业务数据。** 前端通过 API 访问数据，不直接连接数据库；
测试网页保留正常的业务写入功能，因此保存、报工、库存调整等操作会影响正式数据。

## 技术栈

- Angular 19、TypeScript、RxJS
- ng-alain / Delon、NG-ZORRO
- REST API 与 GraphQL，通过同源 `/api/` 代理访问
- Node.js 22 用于开发和构建，Nginx 用于提供生产静态资源与 API 代理

## 本地开发

准备 Node.js 22 和 npm，然后执行：

```sh
git clone --branch V19.2 https://github.com/garyzhangscm/cwms-client.git
cd cwms-client
npm ci --legacy-peer-deps
npm run start:colton
```

开发网站运行在 `http://localhost:4200/`。该启动命令监听 `0.0.0.0`，也允许通过开发机的 IP 访问。
现有依赖包含部分较旧的组件，因此安装时使用 `--legacy-peer-deps` 与 Docker 构建保持一致。

开发代理配置在 [proxy.conf.js](proxy.conf.js)，可以通过环境变量修改目标：

| 变量 | 开发默认值 | 用途 |
| --- | --- | --- |
| `COLTON_API_TARGET` | `http://10.0.10.159:31252` | Colton 业务 API |
| `MES_ITEM_SETTINGS_TARGET` | `http://10.0.10.101:18790` | Integration Settings |
| `MES_INVENTORY_HANDOFF_TARGET` | `http://10.0.10.159:18791` | 库存交接地点 |

例如：

```sh
COLTON_API_TARGET=http://your-api-host:5555 npm run start:colton
```

生产编译：

```sh
npm run build
```

输出目录为 `dist/ng-alain-v19-without-ssr/browser/`。

## Docker 打包与上传

安装并启动 Docker，在仓库根目录执行：

```sh
MES_WEB_TAG="v19.2-$(git rev-parse --short HEAD)"
docker build --platform linux/amd64 -f Dockerfile.colton \
  -t "brianwang1912/mes-web:$MES_WEB_TAG" .

docker login -u brianwang1912
docker push "brianwang1912/mes-web:$MES_WEB_TAG"
```

上传需要有该仓库的 Write 权限；服务器下载私有镜像需要 Read 权限。
使用 Google 登录的 Docker Hub 账号可在命令行的密码提示处输入 Personal Access Token。
凭据通过登录工具或部署 Secret 配置，不写入源代码、README 或镜像。

[Dockerfile.colton](Dockerfile.colton) 在构建阶段编译 Angular，最终镜像只包含网页静态文件与 Nginx。
运行架构为 Colton 使用的 `linux/amd64`，提供 `/healthz` 健康检查。
容器运行时的 API 目标通过环境变量配置，详见 [Colton 镜像部署说明](deploy/colton/README.md)。

## 发布流程

1. 在 `V19.2` 开发，并在测试网页确认效果。
2. 生产编译，构建新版本镜像并上传 Docker Hub。
3. 记录镜像 digest；确认 Kubernetes 的私有仓库拉取权限。
4. 更新 `staging` 命名空间的 `webclient` Deployment，使用 digest 锁定镜像版本。
5. 验证滚动更新、网页资源、API 代理和登录后的常用页面。

正式网站保留现有 Service 和 `31252` 访问端口。
发布前保留旧部署配置及镜像版本；异常时回退到上一个已验收版本。

## 项目目录

| 路径 | 内容 |
| --- | --- |
| `src/app/routes/` | 业务页面与路由 |
| `src/app/layout/` | 顶部栏、侧边栏和登录页布局 |
| `src/app/core/` | 启动逻辑、认证拦截器、主题与基础服务 |
| `src/styles/mes-workspace.less` | MES 共享外观与配色变量 |
| `src/environments/` | Angular 环境配置 |
| `deploy/` | 开发服务和部署说明 |

测试服务器的开发服务管理方法见 [开发环境说明](deploy/README.md)。
