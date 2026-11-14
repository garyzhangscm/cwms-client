import { Menu } from './menu'; 
import { Permission } from './permission';
import { Role } from './role';

export interface RolePermission {
  id?: number;
  role: Role;
  permission: Permission;
  allowAccess: boolean;
}
