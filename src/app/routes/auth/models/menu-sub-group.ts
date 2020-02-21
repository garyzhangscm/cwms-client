import { Menu } from '@delon/theme';

export interface MenuSubGroup {
  id: number;
  text: string;
  i18n: string;
  icon: string;
  shortcutRoot: boolean;

  menus: Menu[];
  sequence: number;
  link: string;
  badge: number;
}
