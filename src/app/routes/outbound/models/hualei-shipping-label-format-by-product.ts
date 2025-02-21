import { HualeiShippingLabelFormat } from "./hualei-shipping-label-format";

export interface HualeiShippingLabelFormatByProduct {
    
    id?: number;
    warehouseId: number;
    productId: string;
    shippingLabelFormat: HualeiShippingLabelFormat;
    trackingInfoUrl?: string;
 
}
