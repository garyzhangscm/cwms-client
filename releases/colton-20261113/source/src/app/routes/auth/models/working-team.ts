import { User } from './user';

export interface WorkingTeam {
  id: number;

  name: string;
  description: string;
  enabled: boolean;
  users: User[];
}
