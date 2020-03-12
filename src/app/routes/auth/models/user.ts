import { Role } from './role';

export interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  enabled: boolean;
  locked: boolean;
  roles: Role[];
}
