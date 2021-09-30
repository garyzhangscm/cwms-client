import { Menu } from './menu';
import { MenuGroup } from './menu-group';
import { User } from './user';

export interface Role {
  id: number;
  name: string;
  companyId: number;
  description: string;
  enabled: boolean;
  menuGroups: MenuGroup[];
  menus: Menu[];
  users?: User[];
}
