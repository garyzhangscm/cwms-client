import { Unit } from "../../common/models/unit";
import { BillableCategory } from "./billable-category";
import { BillingCycle } from "./billing-cycle";

export interface BillingRate {
   
    id?: number;
    companyId: number;
    warehouseId?: number;
    clientId?: number;
    billableCategory: BillableCategory;

    rate: number;
    rateUnit?: Unit;
    rateUnitName?: string;
    rateByQuantity?: boolean;
    billingCycle: BillingCycle;
    enabled: boolean;

    rateAtTransaction?: boolean;

}
