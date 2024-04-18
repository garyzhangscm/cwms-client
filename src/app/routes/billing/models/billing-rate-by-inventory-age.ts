import { Unit } from "../../common/models/unit";
import { BillableCategory } from "./billable-category";
import { BillingCycle } from "./billing-cycle";
import { BillingRate } from "./billing-rate";

export interface BillingRateByInventoryAge {
   
    id?: number;
    companyId: number;
    warehouseId?: number;
    clientId?: number;
    
    startInventoryAge: number;
    endInventoryAge: number;
    
    billingRates: BillingRate[];
    enabled: boolean;

}
