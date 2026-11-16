# Colton allocation mode UI

Apply allocation-mode.patch from the November 13 archived frontend source root.
It restores the existing Allocation Mode component controls while retaining the rules list.
The live outbound image already serves GET and PUT at /outbound/outbound-configuration/allocation-mode.

Image: localhost/mes-web-local:allocation-ui-20261115-01
Image ID: sha256:185077c6dd4d3fb9e553e19c05a567cfe086d1e19b2ea5a2a23c01b5de6dfa86
Browser entry: main-DNR4DXJG.js
Nginx: colton-web-login-route-20261114-01

Verified Angular production build and isolated browser read/save/reload and rules search.
Verified the deployed entry and login page, and synchronized the frontend startup manifest.


## Colton V19.1.65

The release restores the Warehouse report menu, QC Shift Report date and item-family filters, UOM level editing, item footprint weight editing and create validation, the Sales Order shipment print dialog, and the Inventory and Inventory Activity layouts. QC report export uses the same period and family selection.

The Colton web image uses `brianwang1912/cwms-client:V19.1.65`. The companion QC report image uses `brianwang1912/mes-qc-shift-report:V1.65`. The pinned multi-platform image references are in [dockerhub-images.tsv](dockerhub-images.tsv).

The repository keeps browser Maps configuration external through `globalThis.__MES_PUBLIC_CONFIG__.googleMapsApiKey`. Supply the configured browser key when building or deploying the frontend. Colton's site-specific Nginx routing and runtime configuration live with the cluster deployment.

The Angular production build passed on both architectures. Browser tests exercised the restored QC filters, native UOM save, item required fields, inventory search behavior and shipment print controls. The QC report backend passed 54 tests covering scope validation and consistent Excel/PDF exports.
