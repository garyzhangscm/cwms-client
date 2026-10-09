import type { Menu } from '@delon/theme';

const sections = [
  { text: 'Overview', keys: ['menu.dashboard'] },
  { text: 'Production', keys: ['menu.main.work-order', 'menu.main.qc'] },
  { text: 'Warehouse & Logistics', keys: ['menu.main.inbound', 'menu.main.inventory', 'menu.main.outbound', 'menu.main.transport'] },
  { text: 'Finance', keys: ['menu.main.billing', 'menu.main.report', 'menu.main.alert'] },
  { text: 'Administration', keys: ['menu.main.layout', 'menu.main.common', 'menu.main.integration', 'menu.main.work-task', 'menu.main.auth', 'menu.main.util'] }
];

const labels: Record<string, string> = {
  'menu.main.auth': 'Users & Permissions',
  'menu.main.common': 'Master Data',
  'menu.main.util': 'Tools'
};

const productionSections = [
  { text: 'Planning', routes: ['bill-of-material', 'production-plan', 'mps', 'mps-view', 'mps-export', 'mrp'] },
  { text: 'Work Orders & Execution', routes: ['work-order', 'work-order-flow', 'produce-transaction', 'pre-print-lpn-label'] },
  { text: 'Lines & Equipment', routes: ['production-line-assignments', 'production-line', 'production-line-type', 'mould'] },
  { text: 'Monitoring & Performance', routes: ['production-line-dashboard', 'production-line-status', 'production-line-monitor', 'production-line-monitor/transaction', 'light-mes-status-dashboard', 'silo', 'finish-good-productivity-report', 'production-mold-count-history'] },
  { text: 'Labor', routes: ['labor', 'labor-activity'] },
  { text: 'Configuration', routes: ['work-order-configuration', 'qc-rule-configuration', 'silo-configuration', 'light-mes-configuration'] }
];

function organizeProduction(entry: Menu): Menu {
  const source = entry.children ?? [];
  const settings = source.find(item => item.link === '/work-order/production-line');
  const items = settings && !source.some(item => item.link === '/work-order/production-line-assignments')
    ? [...source, { ...settings, text: 'Work Order Assignments', i18n: 'line-assignments.title',
        link: '/work-order/production-line-assignments', children: undefined }]
    : source;
  // Avoid nesting the same categories again when a processed menu is supplied.
  if (!items.length || items.every(item => item.children && !item.link)) return entry;
  const used = new Set<Menu>();
  const children: Menu[] = [];
  for (const section of productionSections) {
    const links: Menu[] = [];
    for (const route of section.routes) {
      for (const item of items.filter(candidate => candidate.link === `/work-order/${route}`)) {
        used.add(item);
        links.push(item);
      }
    }
    if (links.length) children.push({ text: section.text, children: links });
  }
  const remaining = items.filter(item => !used.has(item));
  if (remaining.length) children.push({ text: 'Other Production Tools', children: remaining });
  return { ...entry, children };
}

/** Reorganize the supplied menu while preserving the supplied module permissions. */
export function organizeWorkspaceMenu(menu: Menu[]): Menu[] {
  // Hide the legacy table board while retaining the overview card board and its route.
  const visibleMenu = (entries: Menu[]): Menu[] => entries
    .filter(entry => entry.link !== '/work-order/production-kanban')
    .map(entry => {
      const labelled = entry.link === '/work-order/production-line'
        ? { ...entry, text: 'Production Line Settings', i18n: 'line-assignments.settings' }
        : entry.link === '/work-order/produce-transaction'
        ? { ...entry, text: 'Production Records', i18n: 'work-order.production-records' }
        : entry;
      return labelled.children ? { ...labelled, children: visibleMenu(labelled.children) } : labelled;
    });
  const modules: Menu[] = [];
  const extra: Menu[] = [];
  for (const entry of visibleMenu(menu)) {
    // Keep restricted group wrappers intact so their visibility rules still apply.
    if (entry.group && !entry.acl && !entry.hide && !entry.disabled) {
      modules.push(...(entry.children ?? []));
    } else if (!entry.group) {
      modules.push(entry);
    } else {
      extra.push(entry);
    }
  }

  const used = new Set<Menu>();
  const result: Menu[] = [];
  for (const section of sections) {
    const children: Menu[] = [];
    for (const key of section.keys) {
      for (const entry of modules.filter(item => item.i18n === key)) {
        used.add(entry);
        children.push(key === 'menu.main.work-order' ? organizeProduction(entry)
          : labels[key] ? { ...entry, text: labels[key], i18n: undefined } : entry);
      }
    }
    if (children.length) result.push({ text: section.text, group: true, children });
  }
  const remaining = modules.filter(entry => !used.has(entry));
  if (remaining.length) result.push({ text: 'Other', group: true, children: remaining });
  return [...result, ...extra];
}
