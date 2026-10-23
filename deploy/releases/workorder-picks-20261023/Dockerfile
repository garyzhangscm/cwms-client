FROM --platform=$BUILDPLATFORM node:22-alpine@sha256:fe4f6d74e20370acb04ad889077d14d0f64a9c8ea6a42bc60cddf1e844699914 AS build
WORKDIR /app
ENV HUSKY=0 NG_CLI_ANALYTICS=false
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN node validation/workorder-pick-scope.check.cjs
RUN node --max_old_space_size=8000 node_modules/@angular/cli/bin/ng build --configuration production

# Keep the current runtime, entrypoint, legacy assets and site-mounted Nginx configuration.
FROM brianwang1912/mes-web:v19.2-import-orders-20261022-02@sha256:d4c92a82f0d79da059982325fb625f2649275bfbf0e891de375e34f627406ae3
COPY --from=build /app/dist/ng-alain-v19-without-ssr/browser/ /usr/share/nginx/html/
# This ignored local build input preserves existing browser-public configuration.
# It is provisioned privately and never committed; no credential rotation is performed.
COPY .release-public-config.js /usr/share/nginx/html/mes-public-config-20261023.js
RUN sed -i 's@</head>@<script src="/mes-public-config-20261023.js"></script></head>@' /usr/share/nginx/html/index.html
