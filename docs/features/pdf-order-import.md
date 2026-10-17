# PDF order import (test environment)

Outbound Orders replaces its legacy order-file upload entry with **Import PDF**. The independent review page reads a packing slip into an editable draft and writes an order only after explicit acknowledgement and **Create Order**. Other file-upload tools and document attachments remain unchanged.

## Reading and review

PDF.js reads the text layer and renders a page preview. Image-only pages, or every page when explicitly selected, use the local English Tesseract engine. Worker code, WebAssembly, fonts and English model data are served by the application itself through Angular asset configuration. PDF bytes and recognition results are not sent to an external recognition provider, stored in browser storage or uploaded as a document. System customer/item matching uses the existing authenticated read APIs.

The initial geometry parser targets English packing slips with an invoice identifier, Ship To block, and Item Code / Quantity table, including the Ecotech-style sample layout. It does not promise arbitrary document understanding. Unsupported layouts leave fields blank for manual review rather than inventing data. Separate invoice identities or customer POs in one document are rejected. Password-protected files, files over 15 MB and documents over 10 pages are rejected. Recognition can be cancelled.

The invoice number is suggested as the order number, not treated as a separate confirmed sales-order identifier. Carton counts stay separate from order quantities. Reference invoice dates and delivery numbers are shown for review only; they are not silently mapped to unsupported scheduling fields. Originals remain visible alongside editable customer, address and line fields. Existing customers must be selected; this workflow never silently creates master data.

System units come from item packaging and the stock unit. The review page shows the PDF unit, selected measurement unit, conversion and resulting stock quantity. Unknown or ambiguous units require an explicit selection. Fractional/nonpositive/non-safe-integer stock quantities are blocked. Tracked item attributes are required when configured. Rows can be added, corrected or removed. Editing invalidates acknowledgement; the originally read source quantity remains visible.

## Creation boundary

Only sales orders are created by this initial workflow, with existing FIFO defaults and an explicitly selected inventory status. Manual picking is enabled by default for new orders and can be switched off in review. When enabled, the shipping stage group and an available location are required; location availability is rechecked before dispatch. Existing orders keep their saved setting. Outsourced orders do not default to manual picking. Client ownership is validated for selected items. The route and creation controls follow the existing order permissions and display-only setting. Warehouse/account changes block submission. Duplicate order numbers and current packaging are checked again before dispatch.

One order POST is dispatched at most once per draft. A timeout or uncertain acknowledgement locks further writes and directs the user to check the order list. No automatic retry is performed. This avoids blindly duplicating an order when the server may have completed an earlier request. The existing backend remains responsible for persistence and authorization.

The designated test website shares the live backend. Development verification must use mocks for writes; do not create sample orders without specific authorization. The initial implementation changed only the Web source; the separately authorized Colton release is recorded below. No backend or OTA update was required.

## Verification

```sh
node tools/test-pdf-order-import.cjs
```

The regression executes the actual parser, unit mapper and component submission logic with mocked services. It covers line wrapping, quantity versus cartons, total mismatch, invoice separation, unsupported layouts, unit conversion, permissions, explicit acknowledgement, duplicate numbers, double-clicks, uncertain writes, whitespace and warehouse changes. An optional private text-coordinate fixture and separate expected-value JSON can be supplied as two arguments. Do not commit customer PDFs, extracted business data, credentials or browser session state.

Browser checks should exercise the actual PDF worker and both native text and OCR paths with a local sample file, stop at the review page, and verify that no order write was issued. Run the Angular template compiler and development build after changes.

Dependencies: [PDF.js examples](https://mozilla.github.io/pdf.js/examples/), [Tesseract worker API](https://github.com/naptha/tesseract.js/blob/master/docs/api.md).

Inventory status defaults to the warehouse’s AVAL status. Reference reloads preserve an existing valid selection; if AVAL is unavailable, PDF import requires an explicit status choice. New maintenance order lines also prefer AVAL. Existing order lines are unchanged.

## Colton release — 2026-10-16

Published as the PDF-only overlay on the running Colton Web baseline. Native PDF and forced OCR were verified in the formal browser with an unsaved draft; no Create Order was submitted. The final Nginx image serves `.mjs` as JavaScript, and PDF module URLs carry a version to avoid old MIME caches. PDF icon registration is included. The existing backend and other pending test changes were not deployed. See `deploy/colton-pdf-import-release-20261016.json` for the exact final image and validation.

The normal maintenance-form defaults remain test-only. The deployed PDF importer has its own AVAL and manual-pick defaults.
