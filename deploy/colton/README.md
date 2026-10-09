# Frontend container deployment

The runtime image contains compiled frontend files and Nginx. It does not include
a database, account credentials or the Node development server.
Environment addresses, registry identities, cluster configuration and release records are managed privately.

## Build and push

Set `IMAGE_REPOSITORY` to the full image repository name and `REGISTRY_HOST` to
the registry login address. From the source repository root, run:

```sh
MES_WEB_TAG="v19.2-$(git rev-parse --short HEAD)"
docker build --platform linux/amd64 -f Dockerfile.colton \
  -t "$IMAGE_REPOSITORY:$MES_WEB_TAG" .
docker login "$REGISTRY_HOST"
docker push "$IMAGE_REPOSITORY:$MES_WEB_TAG"
```

The build stage uses the build host's CPU architecture; this example targets
`linux/amd64` for the runtime image. Choose the architecture required by the deployment host.
Record the registry digest after pushing and use it to pin the deployment version.

## API routing

Set runtime proxy targets through environment variables without rebuilding the frontend:

| Variable | Purpose |
| --- | --- |
| `COLTON_API_TARGET` | Main business API gateway |
| `MES_ITEM_SETTINGS_TARGET` | Integration Settings API |
| `MES_INVENTORY_HANDOFF_TARGET` | Inventory handoff API |
| `ADMINER_TARGET` | Adminer proxy |

Configure all endpoints using the target environment's internal configuration.
The API target must point to a backend entry point, not the new frontend itself,
to avoid a proxy loop.

## Standalone validation

Set the image repository and tag, and export all proxy target variables before running:

```sh
docker run -d --name mes-web-preview -p 127.0.0.1:14200:80 \
  -e COLTON_API_TARGET \
  -e MES_ITEM_SETTINGS_TARGET \
  -e MES_INVENTORY_HANDOFF_TARGET \
  -e ADMINER_TARGET \
  "$IMAGE_REPOSITORY:$MES_WEB_TAG"
```

This example binds a separate local port. The container exposes a `/healthz` endpoint.

## Kubernetes rollout

Keep the previous deployment configuration and image version for rollback.
Private repositories require an `imagePullSecret` with repository Read access.
Update the target Deployment image, retain the existing Service and verify rollout status,
frontend assets, API routing and authenticated pages. Roll back to an accepted version if validation fails.

Configure credentials through login tools and Secrets. Do not include credentials
in repository documentation or container images.
