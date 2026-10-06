# Colton work-order and user release — 2026-10-06

Includes the work-order deletion entry and translated confirmation, condition-required Search and Reset behavior, production-record labels, immediate completion success redirect, and the dedicated administrator password-reset dialog with selected name/login identity and matching-password validation.

Production backend dependencies: deploy protected Workorder deletion/completion and the new Resource `/users/{id}/password-reset` API before this Web. Development-only deletion, completion and password-reset proxy routes remain separate and fail closed when their service targets are unset. Formal Colton uses the normal gateway routes; Fay is not part of this release.

Validation: mocked API checks in `check-work-order-search-pagination.cjs`, `check-work-order-deletion.cjs` and `check-user-password-reset.cjs`, plus a production Angular build. Secret fields are cleared when the reset dialog closes or succeeds and only one dialog may be open. Admin/company rules are checked again by the backend. Production reset requires a JSON request body and defaults to forcing a change at next sign-in.

Keep original image references and Kubernetes manifests for rollback. Test pages still use the formal database as explicitly authorized earlier; no real passwords or deletion tests were submitted by the agent. Existing route permissions and Production Records route URLs are retained.
