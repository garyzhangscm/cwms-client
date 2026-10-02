# Frontend development

Baseline: `v19.1.64`. Use Node.js 22 for development and builds.
Environment-specific addresses, accounts and release records are managed privately.

## Run

```sh
npm ci --legacy-peer-deps --no-audit --no-fund
npm run start:colton
```

The development server uses port 4200. Set `COLTON_API_TARGET`,
`MES_ITEM_SETTINGS_TARGET` and `MES_INVENTORY_HANDOFF_TARGET` to the appropriate
API endpoints before starting.

The proxy in `proxy.conf.js` is used by `ng serve`, not by a static production build.
Production builds use `Dockerfile.colton` and the Nginx template documented in
[Container deployment](colton/README.md).

## Development server service

Install the development service file in `~/.config/systemd/user/`, then run:

```sh
systemctl --user daemon-reload
systemctl --user enable --now mes-web-dev
systemctl --user status mes-web-dev
journalctl --user -u mes-web-dev -n 80 --no-pager
```

An administrator can configure user-service persistence according to the host's
internal operating policy.

## Verification

Confirm the selected backend and dataset before testing. Use page loads and
read-only requests for smoke checks; business actions can modify backend data.
Accept changes in the test environment before releasing a separate image.
