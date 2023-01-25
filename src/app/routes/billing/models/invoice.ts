import { Client } from "../../common/models/client";
import { InvoiceLine } from "./invoice-line";

export interface Invoice {
    
    id?: number;

    companyId: number;
    warehouseId: number;
    clientId?: number;
    client?: Client;

    number: string;
    referenceNumber: string;
    comment: string;

    startTime?: Date;

    endTime?: Date;
    lines: InvoiceLine[];
    totalCharge: number;

    invoiceDate?: Date;
    dueDate?: Date;
    fileName?: string;
}
