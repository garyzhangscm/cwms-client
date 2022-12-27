import { EasyPostFee } from "./easy-post-fee";
import { EasyPostPostageLabel } from "./easy-post-postage-label";
import { EasyPostRate } from "./easy-post-rate";

export interface EasyPostShipment {
    
    selectedRate: EasyPostRate;
    
    rates: EasyPostRate[];

    postageLabel: EasyPostPostageLabel;
    insurance: string;
    trackingCode: string;
    fees: EasyPostFee[];
    
    id: string;
    mode: string;
    createdAt: Date;
    updatedAt: Date;

}
