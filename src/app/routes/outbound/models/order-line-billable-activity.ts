import { BillableActivityType } from '../../billing/models/billable-activity-type'; 

export interface OrderLineBillableActivity {
  id?: number;
   
  warehouseId: number;
  clientId?: number;
  billableActivityTypeId?: number;
  billableActivityType?: BillableActivityType;
  activityTime?: Date;
  rate?: number;
  amount?: number;
  totalCharge?: number;
}
