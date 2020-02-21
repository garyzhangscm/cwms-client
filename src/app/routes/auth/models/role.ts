import { Menu } from '@delon/theme';

export interface Role {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  menus: Menu[];
}
