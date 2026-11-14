import { EasyPostCarrier } from "./easy-post-carrier";

export interface EasyPostConfiguration {
    
    id?: number;

    warehouseId: number;

    apiKey: string;
    webhookSecret: string;
    
    carriers: EasyPostCarrier[];

    useWarehouseAddressAsShipFromFlag: boolean;
    
    contactorFirstname?: string;
    contactorLastname?: string;

    addressLine1?: string;
    addressLine2?: string;
    addressCountry?: string;
    addressState?: string;
    addressCounty?: string;
    addressCity?: string;
    addressDistrict?: string;
    addressPostcode?: string; 
    
    useWarehouseAddressAsReturnFlag: boolean;
    
    returnContactorFirstname?: string;
    returnContactorLastname?: string;

    returnAddressLine1?: string;
    returnAddressLine2?: string;
    returnAddressCountry?: string;
    returnAddressState?: string;
    returnAddressCounty?: string;
    returnAddressCity?: string;
    returnAddressDistrict?: string;
    returnAddressPostcode?: string; 
}
