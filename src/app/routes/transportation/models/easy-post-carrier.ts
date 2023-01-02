import { Carrier } from "./carrier";

export interface EasyPostCarrier {
    
    id?: number;

    warehouseId: number;

    carrierId: number;
    carrier?: Carrier;
    accountNumber: string;
 
}
