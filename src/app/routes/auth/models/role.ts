import { User } from './user';
import { MenuGroup } from './menu-group';

export interface Role {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  menuGroups: MenuGroup[];
  users?: User[];
}
