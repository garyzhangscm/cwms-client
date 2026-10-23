# Repository deployment configuration

Real site addresses and credentials belong in private deployment configuration.
Never commit .env files, private keys, production captures or server configuration.

Docker defaults use service DNS names. Override COLTON_API_TARGET,
MES_ITEM_IMPORT_TARGET, MES_WORK_ORDER_IMPORT_TARGET, MES_ITEM_SETTINGS_TARGET and
MES_INVENTORY_HANDOFF_TARGET with the correct site targets when deploying.
The development proxy defaults to loopback services and will not contact a
production site unless explicitly configured.

Release tooling requires private environment settings:
- MES_FORBIDDEN_SITE_PREFIX: forbidden address prefix of the other site.
- MES_FAY_WEB_BASE: FAY's public Web entry for post-deployment checks.
- MES_TEST_NODE_BASE_URL: test node scheme/hostname, without its NodePort.
- MES_TEST_IMAGE_UPSTREAM: explicitly approved image-based test upstream.
- MES_TEST_PUBLIC_BASE and MES_PREVIEW_PUBLIC_BASE: public test/preview entries.
- MES_HTTP_PROXY_MODULE: optional path to the installed http-proxy package.

The test proxy accepts only the exact MES_TEST_IMAGE_UPSTREAM, preserving its
upstream restriction without a committed address. The generated test systemd unit
supplies this setting and resolves the proxy package relative to the Web user's home.

Release evidence uses redacted example hosts and server-local placeholders.
It records completed checks; it is not deployable site configuration.

Run python3 scripts/check_repository_security.py before committing. This targeted
guard reports paths/line numbers without printing matched values. It does not
guarantee that binary files, Git history or third-party credentials are clean.
Normal cleanup commits do not remove older commits, other branches, tags or caches.
No running production service is changed by these repository-only changes.

