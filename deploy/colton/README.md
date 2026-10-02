# Colton 网页镜像

镜像只包含编译后的前端和 Nginx，不包含数据库、账号密码或 Node 开发服务器。
截至 2026-10-02，Colton 已部署 `brianwang1912/mes-web:v19.2-5c4b3b1`，
前端源码对应 `5c4b3b1`。测试环境继续开发，可能包含尚未发布的改动。

## 构建

在仓库根目录执行：

```sh
MES_WEB_TAG="v19.2-$(git rev-parse --short HEAD)"
docker build --platform linux/amd64 -f Dockerfile.colton -t "mes-web:$MES_WEB_TAG" .
```

构建阶段使用构建机本身的 CPU 架构，运行镜像使用 Colton 的 linux/amd64 架构。

## 后端代理

运行时可以用环境变量设置代理目标，无需重新编译：

| 变量 | 默认目标 | 用途 |
| --- | --- | --- |
| COLTON_API_TARGET | http://apigateway:5555 | Colton 集群 API 网关 |
| MES_ITEM_SETTINGS_TARGET | http://10.0.10.101:18790 | Integration Settings |
| MES_INVENTORY_HANDOFF_TARGET | http://10.0.10.159:18791 | 库存交接地点 |
| ADMINER_TARGET | http://adminer:8080 | 保留旧网站的 Adminer 代理 |

集群内默认目标使用 staging 命名空间的服务 DNS。
替换 31252 对应网页后，COLTON_API_TARGET 不可指向 31252，否则会循环代理。

独立运行验证时，可代理到现有 Colton 网页的 API 入口。
以下命令使用已发布镜像，监听独立的本机端口；不会替换 31252 对应的正式网页：

```sh
docker run -d --name mes-web-preview -p 127.0.0.1:14200:80 \
  -e COLTON_API_TARGET=http://10.0.10.159:31252 \
  -e ADMINER_TARGET=http://10.0.10.159:31252 \
  brianwang1912/mes-web:v19.2-5c4b3b1
```

## 上传与替换

共享仓库为 `brianwang1912/mes-web`。给新镜像添加该仓库的完整标签，再执行 docker push。
上传完成后记录仓库返回的镜像 digest，正式部署使用 digest 锁定版本。
Colton 替换之前，保存 staging/webclient 部署配置和原镜像 digest；通过 Kubernetes 更新部署镜像，并验证滚动更新、网页静态资源、后端代理。
私有仓库还需为 staging/webclient 配置有拉取权限的 imagePullSecret。

Colton 已发布的新镜像：

```text
brianwang1912/mes-web@sha256:c6170575f7370f92fa17d3b384956b5bfb532b472eef3caa3ce644eaa326ac97
```

替换之前使用的旧镜像（用于原版本回退）：

```text
garyzhangscm/cwms-client@sha256:5523cc5a1aec0ca5be16f6a8c1dec820059118c86afb8d3b82438efda462d3b4
```

后续更新在测试验收后执行，保持现有 Service 和 31252 访问地址。
