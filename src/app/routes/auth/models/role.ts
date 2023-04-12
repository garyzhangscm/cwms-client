import { OperationType } from '../../work-task/models/operation-type';
import { Menu } from './menu';
import { MenuGroup } from './menu-group';
import { RoleClientAccess } from './role-client-access';
import { RoleMenu } from './role-menu'; 
import { RolePermission } from './role-permission';
import { User } from './user';

export interface Role {
  id: number;
  name: string;
  companyId: number;
  description: string;
  enabled: boolean;
  menuGroups: MenuGroup[];  // obsoleted
  menus: Menu[];
  users?: User[];
  clientAccesses: RoleClientAccess[]; 
  nonClientDataAccessible: boolean;
  allClientAccess: boolean;
  roleMenus: RoleMenu[];
  rolePermissions: RolePermission[];
  operationTypes: OperationType[];
}
