import { BillableCategory } from "./billable-category";
import { BillingCycle } from "./billing-cycle";
import { BillingRequestLine } from "./billing-request-line";

export interface BillingRequest {
    
    
    id: number;

    companyId: number;
    warehouseId: number;
    clientId: number;

    number: string;
    billableCategory: BillableCategory;

    rate: number;

    billingCycle: BillingCycle;
    billingRequestLines: BillingRequestLine[];

    totalAmount: number;
    totalCharge: number;
}
