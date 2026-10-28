# Preserve the complete production source

The user explicitly requires checking the latest code before every release and preventing accidental overwrites of completed work. Do not permanently pin releases to any particular snapshot, commit, branch, or directory.

- Before every release, fetch and inspect the relevant remote branches and compare them with the current production image/source provenance, local uncommitted changes, and accepted changes in test environments or other working copies. Determine the latest complete release candidate from this evidence; neither the newest timestamp nor remote HEAD alone proves completeness. Preserve and reconcile work before building.
- Commits `83b1155` and `47eaf26`, and `docs/releases/2026-10-28-complete-web-result.json`, document a historical recovery only. They are not a mandatory future baseline or branch ancestry constraint.
- Do not build releases from stale local checkouts, test-server directories, or temporary snapshots without first reconciling them against the latest verified code and all accepted changes identified for the release. Never reset a working copy containing other changes to accomplish this.
- Review the full source diff, including removed files, routes, menus, translations, permissions, and site startup configuration. Merge only intentional changes; preserve unrelated pages.
- Use a preservation manifest appropriate to the verified release baseline; `validation/release-baseline.check.cjs` currently records the October 28 recovery. Run the applicable check in the supported Node build environment. When intentionally changing additional files, review and document the exact changes before updating the manifest/allowlist. Never bypass or regenerate the baseline merely to make the check pass.
- Run relevant actual-component/browser regressions, including existing functionality affected by the merge. Verify candidate assets and feature routes as well as HTTP health; a working homepage does not establish feature preservation.
- Preserve each site's Nginx configuration and startup scripts. Back up the current deployment, validate the candidate before switching, and retain a rollback path.
- Save source changes, evidence and image identities to GitHub for the next release. Temporary directories are not the authoritative record.
- The user is currently testing the complete release. This instruction alone does not authorize another deployment; wait for a subsequent release request.
