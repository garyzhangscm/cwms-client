import { BillableCategory } from "./billable-category";
import { BillingRequest } from "./billing-request";

export interface InvoiceLine {

    id: number;
    
    billingRequest: BillingRequest;

    billableCategory: BillableCategory;

    amount: number;
    rate: number;
    totalCharge: number;
}
