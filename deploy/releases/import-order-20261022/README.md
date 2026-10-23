# Import exceptions, order UI and QC receiving-history release — 2026-10-22

Authorized scope: Work Order Import Exceptions, Item Import Exceptions, QC historical
receiving identification, PDF sales-order import, and order list/maintenance UI.
The user explicitly requires backend release as well as Web, source saved to GitHub,
versioned images, formal deployment and image-based test deployment.

The GitHub V19.2 source at 762925c already contains the selected Web pages, reviewed
PDF/OCR workflow and order list/maintenance changes. Selected source comparison
against the preserved test source found these files identical. Rebuilding that
baseline excludes the unselected Line Clearance and FAY/Olivet in-transit feature.
The original Nginx template is byte-identical to the current formal Web image's
template. Site-specific mounts and environment must be preserved during deployment.

The QC report source adds exact historical receiving evidence to resolve missing
current-inventory joins. Unknown/contradictory evidence still blocks partial reports.
Existing counting, authentication, snapshot ownership and read-only database guards
remain. Full offline Linux regression: 43 passed. Build its image from
`services/qc-shift-report/Dockerfile`. A test dependency image is provided separately.

Build Web from repository root with:
`docker build --platform linux/amd64 -f deploy/releases/import-order-20261022/Dockerfile -t <versioned-web-tag> .`
The builder executes the import, PDF and order regression scripts before compilation.
The runtime derives from the exact currently published Web digest and retains old
hashed assets for already-open clients. Never copy a developer proxy configuration
into runtime routing as a substitute for a validated backend deployment.

Import operators have durable queues, source snapshots and existing import locking.
Before their backend image cutover, recover the current source/config references,
review active jobs and source scope, persist state, stop the old worker and start
exactly one replacement. Do not run parallel workers over the same source/state,
reset queues, invoke test retries, overwrite private configuration, alter import
schedules, or send FAY requests to the Colton import source. Private credentials
remain server-side mounts and must never enter Git or image layers.

Formal deployment and test replacement must be recorded separately, including
Git commit, image digests, previous images, state mounts, ready replica/probe checks,
and rollback paths. Image-based testing must retain the previously separate Line
Clearance test service and must not silently remove its existing acceptance pages.

Released to Colton and FAY production and the image-based test endpoint on 2026-10-22.
See `release-evidence.json` for exact digests and verification. The final Web image
also handles FAY's explicitly unconfigured Work Order source without repeated error
toasts or action polling. Retry remains disabled. FAY Item retains `fayint_item`,
`deleteSourceFiles=false`, and its existing manual import setup; Colton daily timers
remain active and unchanged. No business import retry was used for verification.

Test URL: http://server.example.invalid:4200 . This streams separate Kubernetes Web/report
workloads running the same production images. The test gateway and import APIs
still use Colton data; retry and order creation are real business actions.
The original Angular/Line Clearance preview remains at http://server.example.invalid:4201 .
The 4200 Line Clearance API and test-preview download paths continue forwarding
to that preserved preview. No Docker daemon was installed on the test Web host.

Rollback: master backups under `/root/k8s/backups/import-orders-*` contain the
previous Deployment/configuration and persistent manifest. Operator backups under
`/root/cwms-import-backups/image-*` contain the old systemd unit (where one existed)
and private state archive. Never restore a state archive after new real actions
have run without reconciling them. Test entry backup is under the Web user's
`mes-web/release-backups/`; restore its `mes-web-dev.service`, reload user systemd
and restart that unit to restore the former 4200 entry. Preserve private configs,
credentials, and all current queues during any rollback.

Validation covers the offline frontend/backend suites, production compilation,
exact image rollout readiness, Nginx, homepage/cache and PDF module MIME, missing
asset 404s, import anonymous access guards, unconfigured-source rejection, report
health, existing schedule retention and preserved test routes. Authenticated
business acceptance and sample PDF confirmation remain operator checks; no real
order was created and no inventory or schema was changed by release QA.

FAY runtime check identified report health reachable inside its own pod but
unreachable from Web while scheduled on the Kafka node. The report is now pinned
to the existing application node `k8s-app1-ar`; its persistent manifest and private
rollback backup include this placement. No cluster-wide networking change was made.

FAY API JSON routing correction (2026-10-22): its site-specific Nginx template
used `location /api/`, allowing the static JSON regex to intercept language-file
requests. `fix_fay_api_route.py` switches only that directive to `location ^~ /api/`,
using a new ConfigMap with private rollback backups and a persisted manifest.
It retains the shared Web image and all site-specific upstreams. Run this script
on the FAY master only. Both English and Chinese language files are now included
in `verify_http.py`, alongside homepage, missing assets, PDF MIME, import guards
and report-health probes. See `fay-api-route-verification.json` for live evidence.

The follow-up compatibility audit also protects FAY's disabled inventory-handoff
and integration-settings prefixes from the JSON regex. Their JSON subpaths now
return the existing intentional 503 JSON response instead of a static 404; neither
service is enabled. The persistent frontend manifest now embeds the exact active
ConfigMap as well as its Deployment reference. `fix_fay_api_route.py --persist-current`
can reconcile that manifest from the already-verified live configuration without
changing or restarting live resources. See `post-release-compatibility-audit.json`.
