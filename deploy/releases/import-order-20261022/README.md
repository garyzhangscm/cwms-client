# Import exceptions, order UI and QC receiving-history release — 2026-10-22

Sites: Colton and FAY formal environments, plus the existing test environment. Factory import sources must remain isolated.

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

Status is tracked in the external release directory; this document does not claim
a completed upload, rollout or business import. Network access and final factory
scope must be resolved before deployment.
