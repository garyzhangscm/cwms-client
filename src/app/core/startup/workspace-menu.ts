import type { Menu } from '@delon/theme';

const sections = [
  { text: 'Overview', i18n: 'workspace.section.overview', keys: ['menu.dashboard'] },
  { text: 'Production', i18n: 'workspace.section.production', keys: ['menu.main.work-order', 'menu.main.qc', 'qc-shift.reports-menu'] },
  { text: 'Warehouse & Logistics', i18n: 'workspace.section.warehouse-logistics', keys: ['menu.main.inbound', 'menu.main.inventory', 'menu.main.outbound', 'menu.main.transport', 'warehouse-reports-menu'] },
  { text: 'Finance', i18n: 'workspace.section.finance', keys: ['menu.main.billing', 'menu.main.report', 'menu.main.alert'] },
  { text: 'Administration', i18n: 'workspace.section.administration', keys: ['menu.main.layout', 'menu.main.common', 'menu.main.integration', 'menu.main.work-task', 'menu.main.auth', 'menu.main.util'] }
];

const labels: Record<string, string> = {
  'menu.main.auth': 'Users & Permissions',
  'menu.main.common': 'Master Data',
  'menu.main.util': 'Tools'
};

// One outline icon family, with a distinct symbol for each business module.
const moduleIcons: Record<string, string> = {
  'menu.dashboard': 'dashboard',
  'menu.main.work-order': 'control',
  'menu.main.qc': 'safety-certificate',
  'menu.main.inbound': 'import',
  'menu.main.inventory': 'gold',
  'menu.main.outbound': 'export',
  'menu.main.transport': 'car',
  'menu.main.billing': 'account-book',
  'menu.main.report': 'bar-chart',
  'menu.main.alert': 'bell',
  'menu.main.layout': 'layout',
  'menu.main.common': 'database',
  'menu.main.integration': 'api',
  'menu.main.work-task': 'profile',
  'menu.main.auth': 'team',
  'menu.main.util': 'tool'
};

const productionSections = [
  { text: 'Planning', i18n: 'workspace.section.planning', routes: ['bill-of-material', 'production-plan', 'mps', 'mps-view', 'mps-export', 'mrp'] },
  { text: 'Work Orders & Execution', i18n: 'workspace.section.work-orders-execution', routes: ['work-order', 'work-order-flow', 'produce-transaction', 'pre-print-lpn-label'] },
  { text: 'Lines & Equipment', i18n: 'workspace.section.lines-equipment', routes: ['production-line-assignments', 'production-line', 'production-line-type', 'mould'] },
  { text: 'Monitoring & Performance', i18n: 'workspace.section.monitoring-performance', routes: ['production-line-dashboard', 'production-line-status', 'production-line-monitor', 'production-line-monitor/transaction', 'light-mes-status-dashboard', 'silo', 'finish-good-productivity-report', 'production-mold-count-history'] },
  { text: 'Labor', i18n: 'workspace.section.labor', routes: ['labor', 'labor-activity'] },
  { text: 'Configuration', i18n: 'workspace.section.configuration', routes: ['work-order-configuration', 'qc-rule-configuration', 'silo-configuration', 'light-mes-configuration'] }
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
    if (links.length) children.push({ text: section.text, i18n: section.i18n, children: links });
  }
  const remaining = items.filter(item => !used.has(item));
  if (remaining.length) children.push({ text: 'Other Production Tools', i18n: 'workspace.section.other-production-tools', children: remaining });
  return { ...entry, children };
}

/** Reorganize the supplied menu while preserving the supplied module permissions. */
export function organizeWorkspaceMenu(menu: Menu[]): Menu[] {
  // Hide the legacy table board while retaining the overview card board and its route.
  const visibleMenu = (entries: Menu[]): Menu[] => entries
    .filter(entry => entry.link !== '/work-order/production-kanban')
    .map(entry => {
      const icon = moduleIcons[entry.i18n ?? ''];
      if (icon) entry = { ...entry, icon: { type: 'icon', value: icon, theme: 'outline' } };
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

  // Report navigation is a separate module, with the existing QC permissions retained.
  for (const [index, entry] of modules.entries()) {
    if (entry.i18n !== 'menu.main.qc' || !entry.children) continue;
    const existing = entry.children.find(child => child.link === '/qc/shift-report');
    const source = existing ?? entry.children.find(child => child.link === '/qc/result');
    if (!source) continue;
    modules[index] = { ...entry, children: entry.children.filter(child => child.link !== '/qc/shift-report') };
    if (!modules.some(module => module.i18n === 'qc-shift.reports-menu')) {
      modules.push({ ...entry, text: 'QC report', i18n: 'qc-shift.reports-menu', link: undefined,
        icon: { type: 'icon', value: 'bar-chart', theme: 'outline' },
        children: [{ ...source, text: 'QC Shift Summary', i18n: 'qc-shift.title', link: '/qc/shift-report' }] });
    }
  }

  // Derive report access from the existing Inventory Activity permission; never add roles in the database.
  const inventory = modules.find(m => m.i18n === 'menu.main.inventory');
  const activity = inventory?.children?.find(m => m.link === '/inventory/inventory-activity' && !m.hide && !m.disabled);
  if (inventory && activity && !modules.some(m => m.i18n === 'warehouse-reports-menu')) {
    modules.push({...inventory, text: 'Warehouse report', i18n: 'warehouse-reports-menu', link: undefined,
      icon: {type:'icon',value:'bar-chart',theme:'outline'},
      children: [{...activity,text:'User Activity',i18n:'warehouse-user-activity',link:'/warehouse-report/user-activity'}]});
  }

  const used = new Set<Menu>();
  const result: Menu[] = [];
  for (const section of sections) {
    const children: Menu[] = [];
    for (const key of section.keys) {
      for (const entry of modules.filter(item => item.i18n === key)) {
        used.add(entry);
        children.push(key === 'menu.main.work-order' ? organizeProduction(entry)
          : labels[key] ? { ...entry, text: labels[key], i18n: key } : entry);
      }
    }
    if (children.length) result.push({ text: section.text, i18n: section.i18n, group: true, children });
  }
  const remaining = modules.filter(entry => !used.has(entry));
  if (remaining.length) result.push({ text: 'Other', i18n: 'workspace.section.other', group: true, children: remaining });
  return [...result, ...extra];
}
