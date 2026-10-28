# Production Web release 2026-10-28

Both sites use the same merged application assets. Quantity allocation and Unpick feedback changes are combined with existing role rendering, QC custom ranges/item-family filters and shipment printing guards. Test-only Line Clearance routes are absent. The original site-specific Nginx and runtime bootstrap configuration is unchanged.

Colton image: `brianwang1912/mes-web:v19.2-colton-pick-release-20261028-02`.
Fay image: `brianwang1912/mes-web:v19.2-fay-pick-release-20261028-02`.

Production build passed. Canary verified Nginx syntax, config equality, JavaScript responses and auxiliary read-only health endpoints. Rollouts verified the new index SHA256; both public entry points returned HTTP 200 and the exact same new hash. A short service endpoint convergence retry remains bounded; failure rolls back the deployment and saved manifest.

The earlier -01 candidate was superseded to preserve existing production fixes. Do not redeploy -01.
