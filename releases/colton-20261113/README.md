# Colton web release — 2026-11-13

This directory preserves the source of the Colton release separately from the
development tree. It does not replace newer, unrelated fixes in branch V19.2.
Do not deploy the repository root as though it were this release snapshot.

## Released changes

- Outbound navigation groups Sales Orders, Shipments, Loads, Yard and Wave into the shipping workflow.
- Sales Order search, focused detail/progress, and order-entry layout updates.
- Yard uses horizontal Dock rows and compact Waiting Trailer cards, with drag feedback, shipment details and temporary Dock unavailability/restoration.
- Confirm Loaded records loading; Dispatch Trailer performs shipping separately.
- Loads can plan OPEN and INPROCESS orders before picking/deposit completes. Assignment does not perform picking or shipping. Orders assigned to another Load are excluded. Both status searches retain pagination.
- Wave Reserve/Pick UI, compact list/detail tables, essential columns, modification/deletion protection and cancellation/release entry points.
- Wave search guidance for orders that already have Shipments.
- Pick List uses one row per SKU, actual full-pallet/loose-piece breakdown and a Wave barcode. Existing printer selection, PDF Preview and Download remain.
- Existing production-report retry/duplicate protection is retained.
- The requested QC production-confirmation web page is not enabled by this release. Existing unrelated QC features are not removed.

## Provenance and validation

- Development branch base: `ab205f6274d54dc45898dd2f3ac25c20f1ebf457` (V19.2).
- Final deployed image: `localhost/mes-web-local:load-planning-20261113-01`.
- Previous rollback image: `localhost/mes-web-local:order-workbench-20261113-01`.
- Deployed main bundle: `main-QE6VJUEG.js`; formal HTTP response matched the built bundle and Kubernetes rollout completed.
- The final Load change passed a production Angular build and an isolated browser fixture: pending orders are searchable/selectable, other-Load ownership is excluded, unequal status page counts are handled, plan-only save and reload preserve selections. No pick/load/dispatch requests were made by that test.
- `validation/` preserves the local fixture and browser regression used for the final change; adjust local runtime/browser paths when rerunning elsewhere.
- No formal order data was changed by release verification.

## Rebuild notes

Use Node 22 and the included lockfile (`npm ci`, then `npx ng build --configuration production`) from `source/`.
The archived application files match the deployed build input except that legacy Google Maps browser keys were removed in five files. Supply `globalThis.__MES_PUBLIC_CONFIG__.googleMapsApiKey` externally. No credentials or private site configuration are included.

Preserve the site's current Nginx/startup configuration and the Yard/Wave PDF services; copying static assets alone does not install those backend features. Backend release source is archived under the matching release directory in `garyzhangscm/cwms`.

`SHA256SUMS` records the sanitized archived source. This is a source archive, not a claim that current development HEAD and the production image are identical.
