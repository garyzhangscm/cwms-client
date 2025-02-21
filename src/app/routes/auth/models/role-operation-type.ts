import { OperationType } from '../../work-task/models/operation-type';
import { Role } from './role'; 

export interface RoleOperationType {
  id: number; 
  operationType: OperationType;
  role: Role; 
}
