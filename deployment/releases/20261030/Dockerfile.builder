FROM mes-web-merged-builder:20261029
COPY src/ /app/src/
COPY validation/ /app/validation/
RUN node validation/release-baseline.check.cjs
RUN node --max_old_space_size=8000 node_modules/@angular/cli/bin/ng build --configuration production
