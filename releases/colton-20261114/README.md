# Colton login routing fix — 2026-11-14

The generic Nginx static-file regex matched `/api/resource/assets/i18n/en-US.json`
before the `/api/` proxy prefix. The language endpoint returned a local Nginx 404,
even though the gateway returned the complete dictionary successfully.

Exclude `/api/` from the three static-file regexes. Preserve all existing API
feature routes, authentication headers, service targets and private configuration.
The supplied patcher operates on an externally supplied template and is idempotent.

Deployment: webclient image remains `localhost/mes-web-local:load-planning-20261113-01`.
Nginx ConfigMap changed from `colton-web-wave-20261113-01` to
`colton-web-login-route-20261114-01`; the old ConfigMap remains available for rollback.
No backend image, database, credentials or order data was changed.

Validation: rendered Nginx configuration syntax check passed, rollout completed,
language endpoint returned HTTP 200 with valid JSON (2393 top-level keys),
health endpoint returned 200, and a missing static JS asset still returned 404.
Login-page verification does not constitute an authenticated user-login test.
