# Colton PDF import image — 2026-10-16

This is the exact runtime Dockerfile and MIME configuration used for the deployed PDF import image. It extends the previous Web image pinned by digest, replaces only its static Web files, and serves PDF.js `.mjs` files as JavaScript. Existing runtime startup and proxy configuration are inherited from that base image.

## Build context

Supply the verified, production-compiled Web artifacts in `html/` beside this Dockerfile. The directory is ignored by Git. No source PDFs, screenshots, credentials, environment files, or generated business data belong in this context. The Docker build allowlist includes only the recipe, MIME configuration, and supplied static artifacts.

From the repository root:

```sh
mkdir -p deploy/releases/colton-pdf-import-20261016/html
cp -R /path/to/verified-build/browser/. deploy/releases/colton-pdf-import-20261016/html/
docker build --platform linux/amd64 --pull=false \
  -t mes-web-pdf:local-check deploy/releases/colton-pdf-import-20261016
```

The Dockerfile packages prebuilt artifacts; it does not compile source. For an exact historical rebuild, use the verified PDF-only artifact set recorded by the release manifest. Building the current branch can include later or test-only work and is not a substitute for that historical artifact set. Compiled artifacts and the full release source snapshot are retained in the local release backup, outside Git.

See [`../../colton-pdf-import-release-20261016.json`](../../colton-pdf-import-release-20261016.json) for the deployed image digest, scope, and validation. This recipe contains no deployment credentials or environment addresses. Running these build commands does not publish or deploy an image.
