import { WorkerType } from '../models/worker-type';
import { Department } from './department';
import { Role } from './role';
import { WorkingTeam } from './working-team';

export interface User {
  id?: number;
  companyId?:number;
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  email: string;
  enabled: boolean;
  locked: boolean;
  roles: Role[];
  workingTeams: WorkingTeam[];
  changePasswordAtNextLogon: boolean;
  admin?: boolean;
  systemAdmin?: boolean;

  department?: Department;
  position?: string;
  onBoardTime?: Date;

  workerType?: WorkerType;
}
