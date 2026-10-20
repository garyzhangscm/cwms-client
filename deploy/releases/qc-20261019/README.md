# QC release — 2026-10-19 (America/Chicago)

Colton and Fay use the pinned Web, Work Order and read-only report images in images.json. Images were uploaded to the existing Docker Hub repositories. Both sites passed exact-image, readiness, restart-count, Nginx, static-asset, report health, anonymous-access rejection and Work Order read-only health/configuration checks. The final inspector Web patch changes Web/report only; mobile and Work Order stayed on the preceding release.

Web scope: QC report menu and configured-shift summary; distinct-pallet production/inspection counts; snapshot Excel/PDF; Spanish question display; bounded Remove/search refresh and error handling on both QC configuration pages; actual inspector/registrant names and counts; record expansion and links to the existing detailed QC Result view. The result view preserves saved decisions, actual false/zero values, exception notes and disabled historical questions. Sample links include associated inspections across all dates and say so explicitly. PDF/Excel retain the numerical summary format.

Report source, Dockerfile, tests and font license are under services/qc-shift-report. Runtime credentials and deployment Secrets are provisioned separately. Colton retains its current API proxy template; Fay retains its own API/kanban ConfigMap and adds only the report proxy. Preserve each site's existing settings and routes when rebuilding. The new template depends on the cluster-private qc-shift-report service.

Work Order scope is saved in the cwms repository: adjacent/overnight shift validation, list-valued Deassign response decoding, and creation-only real first-sample registrant capture. No schema changes or historical attribution guesses are included.

Android 1.62.4+5 Patch 18 and iOS 1.62.4+6 Patch 7 are stable/active. Mobile source is in cwms-mobile. They contain the preceding Spanish display fix plus real registration identity headers. Unrelated manual-pick source changes in the mobile checkout were excluded from the published OTA snapshot. No native-diff bypass or factory-setting change was used. Physical-device activation/performance acceptance is pending.

Validation: 21 report regressions, actual Web component/model and result-link tests, existing QC Spanish/result/Remove regressions, production Angular build, isolated actual Hibernate/Spring persistence locally and inside the Linux image, and mobile QC regression/analysis. Final authenticated browser clicking was interrupted by a disconnected browser; visual acceptance remains pending. No live QC submission or business-data modification was used for verification.

Known data limitation: an affected Fay historical shift has completed inspections whose inventory relationship is missing. Reports reject partial attribution rather than silently omit records. This release does not repair those business records. Private backups, real data captures, environment files, credentials, container archives, APK/IPA files and raw logs are intentionally excluded from Git.

Rollback: use the previously accepted image digests recorded privately on each site's deployment host and restore the backed-up persistent manifests. Preserve existing database records and configuration. Restore the prior Web/report pair together if reverting inspector detail response handling; no database rollback is required.
