# Production Web release — 2026-10-05

The production board shows one work order per machine by default, with manual expansion for the remaining orders. Type filters support multiple selections and Item requests are deduplicated and loaded concurrently.

Overview precedes Production. Report and Alert are grouped under Finance.

Local label printing waits for the exact inventory receipt (LPN, production transaction, work order and positive quantity) instead of a fixed 2.5-second delay. PDF downloads are asynchronous and validated before printing. Pending label jobs support retry without resubmitting production or reprinting completed labels. Backend-managed printers retain their existing server workflow.

Validation: `node scripts/check-production-label-receipt.cjs` uses mocked API and printer calls to cover receipt correlation, immediate/delayed success, lookup failures, deadlines, cancellation, PDF validation and retry behavior. Existing production build completed. Physical printing is tested by the operator.

Published Web artifact: `brianwang1912/mes-web:v19.2-colton-receipt-20261005`, digest `sha256:151f4dd6984342f2109fbada83a0896266c46d00a151edd8469d1cecd4f0a348`. Fay uses the same Web artifact with its own runtime configuration and Nginx ConfigMap. Environment configuration must be preserved during deployment.
