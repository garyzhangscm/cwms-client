import { MenuSubGroup } from './menu-sub-group';

export interface MenuGroup {
  id: number;
  text: string;
  i18n: string;
  groupFlag: boolean;
  hideInBreadcrumb: boolean;
  menuSubGroups: MenuSubGroup[];
  sequence: number;
}
