import { MenuSubGroup } from './menu-sub-group';
import { MenuType } from './menu-type.enum';

export interface MenuGroup {
  id: number;
  text: string;
  i18n: string;
  groupFlag: boolean;
  hideInBreadcrumb: boolean;
  children: MenuSubGroup[];
  sequence: number;
  type: MenuType;
}
