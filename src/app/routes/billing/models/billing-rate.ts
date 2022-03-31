import { BillableCategory } from "./billable-category";
import { BillingCycle } from "./billing-cycle";

export interface BillingRate {
   
    id?: number;
    companyId: number;
    warehouseId?: number;
    clientId?: number;
    billableCategory: BillableCategory;

    rate: number;
    billingCycle: BillingCycle;
    enabled: boolean;

}
