# Complete web reconciliation — 2026-10-28

The earlier Oct28 web release used an incomplete source snapshot and regressed production pages. Both sites were first restored to their exact previous production image digests. This candidate starts from the source extracted from the immutable Colton pre-release builder (sha256:77575336f9f8796a1083507856daf37134cb86e48b69971938b26773750ba77a), not the stale Git snapshot or test directory.

## Preservation boundary

The baseline manifest covers all 2,001 source files. Exactly 1,999 must remain byte-identical; only outbound/order/order.component.ts and .html incorporate the tested Unpick feedback changes. No source additions/deletions are permitted by validation/release-baseline.check.cjs. Existing quantity-allocation code is already current and remains identical. Route guards, permissions and translations remain intact. Test-only Line Clearance is not added to production.

Preserved functionality includes Item compact list and footprint weight editing, mandatory Item inputs and positive Item-level weight; native UOM Item/Case/Pallet classification and explicit Save; manual customer addresses; Inventory and Inventory Activity layouts, search guards and filters; Warehouse User Activity report/menu/drill-down; QC date/time and Item Family filters; shipment print eligibility; user permission/password UI; work-order Pick handling; quantity allocation including loading-mask recovery and legacy-order routing.

## Intentional changes

Unpick shows immediate button loading, prevents duplicate modal opening/submission, handles unavailable detail fields, requires a return location, keeps the modal on request failure, and refreshes after success. No warehouse quantities or business data are changed by this release procedure. Existing deployed Pick/Unpick backends and mobile OTA are not rebuilt or rolled back.

## Verification

- Production-source manifest check: 2,001 files, two intentional changes only.
- Production Angular compilation.
- Unpick actual-method fixture: duplicate actions, required location, failure feedback and successful refresh.
- Actual Angular quantity-allocation browser fixture: no periodic tick, out-of-zone completion, reused routes, stale responses, partial reservation, replay with same request ID, warehouse guard, legacy mode and network failure; desktop/mobile widths. No production writes.
- Actual Item/UOM browser fixture: blank/zero Item weight rejected, positive decimal accepted, only intended weight changed, Case rules unchanged, final-save guard.
- Inventory column/query/search guards, shipment printing, outbound search/import, QC period and work-order Pick regressions.
- Site-specific runtime Nginx and public configuration are inherited unchanged. Fay retains its existing public-config startup script; Colton retains its existing startup sequence.

The legacy allocation-monitor fixture was updated to call allocateClassicOrder because Allocate now first checks the order mode. The mode-selection path is independently covered by the quantity-allocation browser fixture.
