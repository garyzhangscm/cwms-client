# Preserve the complete production source

The user explicitly requires all future releases to preserve previously completed pages and start from the complete production code, never an older or partial snapshot.

- The reconciled complete baseline is commit `83b1155` on `V19.2`; deployment evidence is recorded in `47eaf26` and `docs/releases/2026-10-28-complete-web-result.json`. Start from the latest verified descendant of this baseline. These commits identify the recovery point, not a requirement to discard later changes.
- Do not build releases from stale local checkouts, test-server directories, or temporary snapshots without first reconciling them against the complete baseline and all subsequent accepted changes. Never reset a working copy containing other changes to accomplish this.
- Review the full source diff, including removed files, routes, menus, translations, permissions, and site startup configuration. Merge only intentional changes; preserve unrelated pages.
- Run `validation/release-baseline.check.cjs` in the supported Node build environment. When intentionally changing additional files, review and document the exact changes before updating the manifest/allowlist. Never bypass or regenerate the baseline merely to make the check pass.
- Run relevant actual-component/browser regressions, including existing functionality affected by the merge. Verify candidate assets and feature routes as well as HTTP health; a working homepage does not establish feature preservation.
- Preserve each site's Nginx configuration and startup scripts. Back up the current deployment, validate the candidate before switching, and retain a rollback path.
- Save source changes, evidence and image identities to GitHub for the next release. Temporary directories are not the authoritative record.
- The user is currently testing the complete release. This instruction alone does not authorize another deployment; wait for a subsequent release request.
