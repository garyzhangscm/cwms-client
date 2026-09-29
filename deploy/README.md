# Colton frontend development

Baseline: `v19.1.64`, commit `639f3cd92e0856959d559c341a9ecf7bd76320b1`.

- Development host: `10.0.202.70`, user `bwang`.
- Server checkout: `/home/bwang/mes-web/cwms-client`.
- Development URL: `http://10.0.202.70:4200`.
- API upstream: `http://10.0.10.159:31252` (Colton production).
- REST and GraphQL use the same-origin `/api/` proxy. No direct database connection.

## Run

Use Node.js 22 (the deployed user-local runtime is 22.23.3).

```sh
npm ci --no-audit --no-fund
npm run start:colton
```

Optionally set `COLTON_API_TARGET` before starting to change the upstream.
The production Nginx configuration is unchanged; the development proxy is
used by `ng serve`, not by a static production build.

## Development server service

Install `mes-web-dev.service` in `~/.config/systemd/user/`, then run:

```sh
systemctl --user daemon-reload
systemctl --user enable --now mes-web-dev
systemctl --user status mes-web-dev
journalctl --user -u mes-web-dev -n 80 --no-pager
```

With `Linger=no`, the user service is not guaranteed to stay running after
all login sessions end or start automatically at boot. An administrator can
enable persistence using `sudo loginctl enable-linger bwang`.

## Verification scope

Use page loading and read-only API requests for development smoke checks.
Colton's data is live: the application retains its normal write functionality.
Do not run business mutations or write-oriented automated tests against it.
Authenticated business flows require a separately agreed verification scope.

Replacing Colton's existing frontend is a later deployment after user acceptance.
