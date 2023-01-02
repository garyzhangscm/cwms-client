import { EasyPostCarrier } from "./easy-post-carrier";

export interface EasyPostConfiguration {
    
    id: number;

    warehouseId: number;

    apiKey: string;
    webhookSecret: string;
    
    carriers: EasyPostCarrier[];
}
