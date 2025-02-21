export interface BillingRequestLine {
    
    id: number;
 
    startTime: Date;

    endTime: Date;

    date: Date;

    totalAmount: number;
    totalCharge: number;
    rate: number;
    

    documentNumber?: string;
    itemName?: string;

    comment?: string;
}
