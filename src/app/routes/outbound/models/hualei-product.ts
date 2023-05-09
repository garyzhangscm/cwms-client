import { Carrier } from "../../transportation/models/carrier";
import { CarrierServiceLevel } from "../../transportation/models/carrier-service-level";

export interface HualeiProduct {
    
    id?: number;

    warehouseId: number;

    productId: string;

    name: string;

    description: string;

    carrierId?: number;
    carrier?: Carrier;
    carrierServiceLevelId?: number;
    carrierServiceLevel?: CarrierServiceLevel;
}
