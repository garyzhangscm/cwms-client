# Safe work-order deletion

The work-order action menu offers Delete work order for apparently unused PENDING drafts. Confirmation names the order and states that deletion is permanent. Confirmation is required before sending DELETE; duplicate submissions while a request is pending are ignored. Backend rejection is displayed and the dialog remains open. Success refreshes the list from page 1.

The frontend visibility check is advisory. The backend must revalidate current status and all business/history references. Single and batch client methods use `DELETE workorder/work-orders` with `warehouseId` and `workOrderIds`; they no longer use the nonexistent single-ID DELETE route or expect a work-order response body.

Validation: `node scripts/check-work-order-deletion.cjs` mocks API calls and covers endpoint/warehouse parameters, eligible visibility, confirmation, duplicate protection, success and rejection. Angular production compilation passed. English and Chinese labels are included.

Deployment requirement: deploy the protected Work Order backend first. The older backend deletion route lacks the new business validations, so this Web entry must not be enabled ahead of it. This implementation has not been deployed to production and has not deleted production orders.

Development now uses `workorder-deletion-test/work-orders`, routed by `MES_WORKORDER_DELETE_TARGET` to an independent protected service. Without that variable, the development proxy fails closed against localhost port 1, instead of forwarding to the legacy production DELETE route. Production builds retain the warehouse-scoped `workorder/work-orders` route and still require the backend update first.

The test Web at 10.0.202.70:4200 has been enabled with this dedicated service connected to the formal Colton database, as explicitly authorized by the user. The original test source and service configuration are backed up under `/home/bwang/mes-web/backups/work-order-safe-delete-20261006`. Formal Web and Work Order deployments are unchanged.
