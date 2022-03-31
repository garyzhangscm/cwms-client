import { InvoiceLine } from "./invoice-line";

export interface Invoice {
    
    id: number;

    companyId: number;
    warehouseId: number;
    clientId: number;

    number: string;
    referenceNumber: string;
    comment: string;

    startTime: Date;

    endTime: Date;
    lines: InvoiceLine[];
    totalCharge: number;
}
