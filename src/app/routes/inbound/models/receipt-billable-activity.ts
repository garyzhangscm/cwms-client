import { BillableActivityType } from '../../billing/models/billable-activity-type'; 

export interface ReceiptBillableActivity {
  id?: number;
   
  billableActivityTypeId?: number;
  billableActivityType?: BillableActivityType;
  activityTime?: Date;
  rate?: number;
  amount?: number;
  totalCharge?: number;
}
