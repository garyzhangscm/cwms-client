import { Menu } from './menu'; 

export interface Permission {
  id: number;
  name: string;
  menu: Menu; 
}
