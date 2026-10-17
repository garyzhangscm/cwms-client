# PDF order import (test environment)

Outbound Orders replaces its legacy order-file upload entry with **Import PDF**. The independent review page reads a packing slip into an editable draft and writes an order only after explicit acknowledgement and **Create Order**. Other file-upload tools and document attachments remain unchanged.

## Reading and review

PDF.js reads the text layer and renders a page preview. Image-only pages, or every page when explicitly selected, use the local English Tesseract engine. Worker code, WebAssembly, fonts and English model data are served by the application itself through Angular asset configuration. PDF bytes and recognition results are not sent to an external recognition provider, stored in browser storage or uploaded as a document. System customer/item matching uses the existing authenticated read APIs.

The initial geometry parser targets English packing slips with an invoice identifier, Ship To block, and Item Code / Quantity table, including the Ecotech-style sample layout. It does not promise arbitrary document understanding. Unsupported layouts leave fields blank for manual review rather than inventing data. Separate invoice identities or customer POs in one document are rejected. Password-protected files, files over 15 MB and documents over 10 pages are rejected. Recognition can be cancelled.

The invoice number is suggested as the order number, not treated as a separate confirmed sales-order identifier. Carton counts stay separate from order quantities. Reference invoice dates and delivery numbers are shown for review only; they are not silently mapped to unsupported scheduling fields. Originals remain visible alongside editable customer, address and line fields. Existing customers must be selected; this workflow never silently creates master data.

System units come from item packaging and the stock unit. The review page shows the PDF unit, selected measurement unit, conversion and resulting stock quantity. Unknown or ambiguous units require an explicit selection. Fractional/nonpositive/non-safe-integer stock quantities are blocked. Tracked item attributes are required when configured. Rows can be added, corrected or removed. Editing invalidates acknowledgement; the originally read source quantity remains visible.

## Creation boundary

Only sales orders are created by this initial workflow, with existing FIFO defaults and an explicitly selected inventory status. Manual picking is not enabled automatically. Normal order maintenance can change order configuration afterwards. Client ownership is validated for selected items. The route and creation controls follow the existing order permissions and display-only setting. Warehouse/account changes block submission. Duplicate order numbers and current packaging are checked again before dispatch.

One order POST is dispatched at most once per draft. A timeout or uncertain acknowledgement locks further writes and directs the user to check the order list. No automatic retry is performed. This avoids blindly duplicating an order when the server may have completed an earlier request. The existing backend remains responsible for persistence and authorization.

The designated test website shares the live backend. A development-only notice explicitly explains that **Create Order** saves a real order. Development verification must use mocks for writes; do not create sample orders without specific authorization. No backend, production image, Docker Hub or OTA release is included in this change.

## Verification

```sh
node tools/test-pdf-order-import.cjs
```

The regression executes the actual parser, unit mapper and component submission logic with mocked services. It covers line wrapping, quantity versus cartons, total mismatch, invoice separation, unsupported layouts, unit conversion, permissions, explicit acknowledgement, duplicate numbers, double-clicks, uncertain writes, whitespace and warehouse changes. An optional private text-coordinate fixture and separate expected-value JSON can be supplied as two arguments. Do not commit customer PDFs, extracted business data, credentials or browser session state.

Browser checks should exercise the actual PDF worker and both native text and OCR paths with a local sample file, stop at the review page, and verify that no order write was issued. Run the Angular template compiler and development build after changes.

Dependencies: [PDF.js examples](https://mozilla.github.io/pdf.js/examples/), [Tesseract worker API](https://github.com/naptha/tesseract.js/blob/master/docs/api.md).
