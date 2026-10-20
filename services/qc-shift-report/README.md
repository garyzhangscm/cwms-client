# Read-only QC shift report service

Serves the QC Shift Summary Web page, configured production shifts, owner-bound report snapshots, and Excel/PDF exports. Report rows include exact first-sample registrations and completed inline inspections with recorded identities. Historical system identities remain unknown. Registration does not imply completion of QC.

All database transactions are READ ONLY and rolled back. No migrations, initialization jobs, record updates or backfills are included. The existing MES gateway verifies the bearer token and company, then the service checks returned identity and QC access. Snapshot exports are restricted to the same login/company/warehouse, expire after 15 minutes and have a 64 MiB total cache cap. Queries and concurrency remain bounded. Missing or ambiguous original production mappings reject incomplete reports.

Build with `docker build --platform linux/amd64 -t <your-report-image> .`. Run on the private service network, reachable only through the existing authenticated Web proxy. The image listens on port 18794; source execution defaults to loopback. Mount a private mode-0400 or 0600 password file owned by the runtime user. Never put credentials in Git or images.

Required runtime variables: `QC_DB_HOST`, `QC_DB_PORT`, `QC_DB_NAME`, `QC_DB_USER`, `QC_DB_PASSWORD_FILE`, `QC_GATEWAY_URL`. Prefer a SELECT-only database account. Optional `QC_SITE_TIMEZONES` is a JSON mapping of warehouse IDs to verified IANA zones, used only when an existing warehouse lacks a zone. Shifts always come from existing configuration; no fallback shifts are invented. `QC_LEGACY_TIMEZONE=UTC` may be set only after verifying legacy storage at that site.

Run `python -m pip install -r requirements-test.txt`, then `python -m unittest -v test_report.py test_finished_mapping.py test_inspector_details.py`. Tests use fixtures/mocks and a local HTTP server; no business database is required. Source checks cover attribution, unknown identities, original work-order/production timing, duplicate inspections, missing mappings, snapshot access, Excel/PDF and unchanged counting rules.

Noto Sans SC is bundled under the adjacent OFL license; ReportLab supplies the Vera font. Existing inspection questions, standards, answers and saved results are never rewritten.
