import { Menu } from './menu';
import { MenuGroup } from './menu-group';
import { RoleClientAccess } from './role-client-access';
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
  clientAccesses: RoleClientAccess[]; 
  nonClientDataAccessible: boolean;
  allClientAccess: boolean;
}
