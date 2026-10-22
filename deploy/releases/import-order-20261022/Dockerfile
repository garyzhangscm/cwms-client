FROM --platform=$BUILDPLATFORM node:22-alpine@sha256:fe4f6d74e20370acb04ad889077d14d0f64a9c8ea6a42bc60cddf1e844699914 AS build
WORKDIR /app
ENV HUSKY=0 NG_CLI_ANALYTICS=false
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN node scripts/check-work-order-import.cjs && node scripts/check-item-import.cjs && node tools/test-pdf-order-import.cjs
RUN node validation/outbound-order-search.check.cjs && node validation/outbound-order-number.check.cjs && node validation/outbound-order-number-input.check.cjs && node validation/outbound-order-import.check.cjs
RUN node --max_old_space_size=8000 node_modules/@angular/cli/bin/ng build --configuration production

# Preserve the exact existing runtime, old hashed assets, routes and entrypoint.
FROM brianwang1912/mes-web:v19.2-qc-inspectors-20261019@sha256:5bd143b214997f226399815bdea535270bba040f92277e4c64b28ed7455b30e4
COPY deploy/colton/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/ng-alain-v19-without-ssr/browser/ /usr/share/nginx/html/
