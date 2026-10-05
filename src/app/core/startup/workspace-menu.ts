import type { Menu } from '@delon/theme';

const sections = [
  { text: 'Overview', keys: ['menu.dashboard', 'menu.main.report', 'menu.main.alert'] },
  { text: 'Production', keys: ['menu.main.work-order', 'menu.main.qc'] },
  { text: 'Warehouse & Logistics', keys: ['menu.main.inbound', 'menu.main.inventory', 'menu.main.outbound', 'menu.main.transport'] },
  { text: 'Finance', keys: ['menu.main.billing'] },
  { text: 'Administration', keys: ['menu.main.layout', 'menu.main.common', 'menu.main.integration', 'menu.main.work-task', 'menu.main.auth', 'menu.main.util'] }
];

const labels: Record<string, string> = {
  'menu.main.auth': 'Users & Permissions',
  'menu.main.common': 'Master Data',
  'menu.main.util': 'Tools'
};

/** Reorganize the supplied menu without adding routes or changing module permissions. */
export function organizeWorkspaceMenu(menu: Menu[]): Menu[] {
  const modules: Menu[] = [];
  const extra: Menu[] = [];
  for (const entry of menu) {
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
        children.push(labels[key] ? { ...entry, text: labels[key], i18n: undefined } : entry);
      }
    }
    if (children.length) result.push({ text: section.text, group: true, children });
  }
  const remaining = modules.filter(entry => !used.has(entry));
  if (remaining.length) result.push({ text: 'Other', group: true, children: remaining });
  return [...result, ...extra];
}
