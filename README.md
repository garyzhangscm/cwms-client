# CWMS / MES Web — V19.2

A web frontend for warehouse and manufacturing operations, including inventory,
work orders, warehouse layout, inbound, outbound and production dashboards.
`V19.2` builds on `v19.1.64`, with improvements to the interface and container deployment workflow.

## What's new

- **Workspace design:** Apple-inspired layouts, system fonts and clearer navigation.
- **Light and dark themes:** A theme switch with browser-local preference persistence.
- **Menus and account pages:** Better spacing, full menu names, dashboard and account views.
- **Production Kanban:** Rounded production-line cards, distinct information levels,
  wrapping item numbers, multiple work orders and responsive layouts.
- **Work orders:** Natural ascending line-number sorting; the Spare Part Maintenance entry is hidden.
- **Configuration pages:** Integration Settings, inventory handoff locations and improved adjustment-threshold forms.
- **Docker packaging:** A multi-stage Angular build with Nginx serving the compiled frontend.

## Technology

- Angular 19, TypeScript and RxJS
- ng-alain / Delon and NG-ZORRO
- REST and GraphQL through a same-origin `/api/` proxy
- Node.js 22 for development and builds; Nginx for the runtime container

## Getting started

Install Node.js 22 and npm. Set `REPOSITORY_URL` to the source repository URL, then run:

```sh
git clone --branch V19.2 "$REPOSITORY_URL"
cd cwms-client
npm ci --legacy-peer-deps
npm run start:colton
```

The development frontend is available at `http://localhost:4200/`.
The startup command binds to `0.0.0.0`, allowing access through the development host's network address.
Use `--legacy-peer-deps` for the existing dependency set, matching the Docker build.

### API configuration

The development proxy is defined in [proxy.conf.js](proxy.conf.js).
Configure the appropriate endpoints using these environment variables:

| Variable | Purpose |
| --- | --- |
| `COLTON_API_TARGET` | Main business API |
| `MES_ITEM_SETTINGS_TARGET` | Integration Settings API |
| `MES_INVENTORY_HANDOFF_TARGET` | Inventory handoff API |

Example endpoint placeholder:

```sh
COLTON_API_TARGET=http://api.example.com npm run start:colton
```

The frontend accesses backend APIs and does not connect directly to a database.
Confirm the selected backend and dataset before testing: business actions can modify backend data.

### Production build

```sh
npm run build
```

Build output: `dist/ng-alain-v19-without-ssr/browser/`.

## Docker image

Install and start Docker. Set `IMAGE_REPOSITORY` to the full image repository name
and `REGISTRY_HOST` to the registry login address. From the repository root, run:

```sh
MES_WEB_TAG="v19.2-$(git rev-parse --short HEAD)"
docker build --platform linux/amd64 -f Dockerfile.colton \
  -t "$IMAGE_REPOSITORY:$MES_WEB_TAG" .
docker login "$REGISTRY_HOST"
docker push "$IMAGE_REPOSITORY:$MES_WEB_TAG"
```

[Dockerfile.colton](Dockerfile.colton) compiles Angular in the build stage.
The runtime image contains static frontend files and Nginx, with a `/healthz` endpoint.
The example targets `linux/amd64`; choose the architecture required by your deployment host.

Pushing an image requires repository Write access; pulling a private image requires Read access.
Keep credentials in login tools or deployment Secrets, outside source files, documentation and images.
Runtime API targets can be changed through environment variables.
See the [container deployment guide](deploy/colton/README.md) for details.

## Release workflow

1. Develop on `V19.2` and validate changes in a test environment.
2. Run a production build, create a versioned image and push it to the registry.
3. Record the image digest and configure registry pull access for the target cluster.
4. Update the target Kubernetes Deployment, pinning the image by digest.
5. Verify rollout status, frontend assets, API routing and authenticated pages.

A GitHub push does not automatically publish the frontend.
Keep the previous deployment configuration and image version for rollback.
Environment addresses, server accounts, registry identities and release records are managed privately.

## Project structure

| Path | Contents |
| --- | --- |
| `src/app/routes/` | Business pages and routes |
| `src/app/layout/` | Header, sidebar and login layouts |
| `src/app/core/` | Startup, interceptors, theme and core services |
| `src/styles/mes-workspace.less` | Shared workspace styling and palette variables |
| `src/environments/` | Angular environment configuration |
| `deploy/` | Development service and deployment documentation |

See the [development environment guide](deploy/README.md) for service management.
