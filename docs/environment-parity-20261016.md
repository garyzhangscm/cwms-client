# Test Web alignment — 2026-10-16

At alignment time, the Colton Web image was `brianwang1912/mes-web:v19.2-colton-preprinted-lpn-20261016@sha256:30b56b650f79755498b2dfdbd1c5654100c91aed31a94db614aace522f69896a`.
The retained release build contains 107 files, all byte-identical to the corresponding running production files. Its retained source is the comparison baseline; Git HEAD alone was not assumed to identify the running release.

## Changes kept on the test Web

- Today's Outbound Order search, compact tables, wrapping, action handling and allocation task tracking.
- Order number whitespace validation, including the existing file-import validation.
- Reviewed PDF import, with browser OCR, explicit review before creation, default manual picking and AVAL status.
- Today's required-field labels and order action simplification.

All other application source and public assets match the retained production source, except the three intentional route simplifications below. Development serving and diagnostic build options remain test infrastructure differences.

## Historical drift corrected

Password reset, work-order completion and guarded deletion now use the same formal endpoints in both development and production. The live formal JARs were inspected read-only for the published reset, completion and deletion implementations before removing preview routing. The old development proxy entries and their launch-time target variables are removed from the test Web.

The test Web's missing preprinted-LPN module/menu wiring is restored from the same code already present in the running production release. Legacy test-only sample assets and obsolete duplicate translation files are backed up before removal.

During alignment, preview Kubernetes Deployments and Services were retained. The alignment itself changed no production image, deployment, configuration or database record. No real completion, deletion, password reset, picking or order creation was submitted during alignment.

## Verification

- Mocked endpoint checks cover test/production parity, warehouse scope and absence of preview proxy entries.
- Existing password reset, guarded deletion and preprinted-LPN regression checks are run with mocked APIs.
- PDF import's 51 mocked checks retain the review and write guards.
- Angular template compilation and source-hash comparison are run on the test server.

A dated file backup and apply manifest are retained on the test server for rollback. This alignment is not authorization to deploy production or remove the preview services.

## Subsequent authorized preview shutdown

After separate user authorization, all four preview Deployments were scaled from one replica to zero. All four Pods exited. Deployment and Service definitions were retained for recovery. After each step, formal Web and health checks returned HTTP 200, and every non-preview Deployment retained its original image and replica count with its prior ready capacity. No business mutation was used for verification. Fay was untouched. Restore a preview, if needed, by scaling its existing Deployment back to one replica.
