# October 30 complete Web release

Reconciled latest origin/V19.2 f43ced1, both verified October 29 production images, and current 4200 source. See source-preservation JSON for the production comparison and source hashes. No production files removed; nine reviewed files changed since production.

## Included work
- Retain October 29 Allocation Configuration mode, Shipment failure recovery, Sales Order filtering/layout/quantities, draft return handling and confirmation layout. These deployed changes had not yet been saved to GitHub.
- Work Order: validate manufactured item and Required Materials, cancel stale lookups, require item/status/positive quantity on existing rows before Add or continue.
- Users: case-insensitive partial username search; percent/asterisk patterns; shared exact account lookups preserved.
- Sales Order: at least one valid line; Item validation and prefix autocomplete with debounce and 20 displayed options; read-only automatic line numbers.
- Printing: persistent Sales Order print options dialog preserves printer Confirm event delivery; existing eligibility remains enforced.

## Preservation
Warehouse Report, QC reports, Item/UOM and weight editing, Inventory Activity, account roles/password reset, Pick/Unpick and quantity reservation preserved. Test-only Line Clearance prototype and temporary backup excluded. Each site's existing Nginx configuration and startup scripts retained.

The historical October 28 preservation checker now allows only the reviewed changed files and one previously deployed Order Maintenance stylesheet addition. Historical hashes remain intact. The independent October 30 manifest checks all 2,002 source files against the verified October 29 production baseline.

## Validation
Relevant component behavior suites and complete Angular builds passed during 4200 testing. User confirmed Big Printer recovery. Automated checks do not send real print tasks. Final merged build, baseline check and candidate deployment checks are recorded alongside image identities.
