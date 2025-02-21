import { Menu } from './menu'; 
import { Role } from './role'; 

export interface RoleMenu {
  id?: number; 
  menu: Menu;
  role?: Role;
  displayOnlyFlag: boolean;
}
