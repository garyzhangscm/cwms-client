import { User } from './user';
import { MenuGroup } from './menu-group';
import { Menu } from './menu';

export interface Role {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  menuGroups: MenuGroup[];
  menus: Menu[];
  users?: User[];
}
