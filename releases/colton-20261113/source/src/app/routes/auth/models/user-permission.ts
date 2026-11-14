import { Menu } from './menu'; 
import { Permission } from './permission';
import { Role } from './role';

export interface UserPermission {
  username: string; 
  permission: Permission;
  allowAccess: boolean;
}
