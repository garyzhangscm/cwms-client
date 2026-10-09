# Work-order search pagination fix — 2026-10-06

Searching with new criteria after navigating to a later page reused that page index. A valid Item with only a few work orders therefore appeared to have no results when the request asked for page 260.

The Search button now resets both the table page and component page tracker to page 1 before requesting results. Clear also resets pagination. Normal page navigation and page-size changes continue using the selected page and current filters.

Validation: `node scripts/check-work-order-search-pagination.cjs` covers a new Item search from page 260, subsequent paging, page-size changes and clearing before the table exists. API requests are mocked. The production Angular build passed with existing bundle-budget and CommonJS warnings.

This commit saves the source fix; publishing the commit does not update deployed Web containers.
