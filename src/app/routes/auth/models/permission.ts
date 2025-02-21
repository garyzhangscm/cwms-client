import { Menu } from './menu'; 

export interface Permission {
  id?: number;
  name: string;
  description: string;
  menu?: Menu; 
  menuName: string;
  menuId: number;
}
