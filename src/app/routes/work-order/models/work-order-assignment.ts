import { WorkOrder } from './work-order';
import { User } from '../../auth/models/user';

export interface WorkOrderAssignment {
  id: number;
  workOrder: WorkOrder;
  userId: number;
  user: User;
}
