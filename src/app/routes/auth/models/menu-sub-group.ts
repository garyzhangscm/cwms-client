import { Menu } from './menu';

export interface MenuSubGroup {
  id: number;
  text: string;
  i18n: string;
  icon: string;
  shortcutRoot: boolean;

  children: Menu[];
  sequence: number;
  link: string;
  badge: number;
}
