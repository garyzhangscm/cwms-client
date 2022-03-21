import { Client } from "../../common/models/client";
import { Customer } from "../../common/models/customer";
import { CustomerReturnOrderLine } from "./customer-return-order-line";
import { ReceiptCategory } from "./receipt-category";
import { ReceiptStatus } from "./receipt-status.enum";

export interface CustomerReturnOrder {
    
    id?: number;

    number: string;


    warehouseId: number; 

    clientId?: number;
    client?: Client;

    rmaNumber: string;

    trackingNumber: string;

    customerId?: number;
    customer?: Customer;

    category: ReceiptCategory;

    customerReturnOrderLines: CustomerReturnOrderLine[];

    status: ReceiptStatus;
    allowUnexpectedItem: boolean;
}
