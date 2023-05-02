import { HualeiShippingLabelFormatByProduct } from "./hualei-shipping-label-format-by-product";

export interface HualeiConfiguration {
    
    id?: number;

    warehouseId: number;
    customerId: string;
    customerUserid: string;

    protocal: string;
    host: string;
    port: string;

    createOrderEndpoint: string;
    printLabelEndpoint: string;

    defaultCargoType: string;
    defaultCustomsClearance: string;
    defaultCustomsDeclaration: string;
    defaultDutyType: string;
    defaultFrom: string;
    defaultIsFba: string;
    defaultOrderReturnSign: string;

    
    defaultHsCode: string;
    defaultInvoiceTitle: string;
    defaultSku: string;
    defaultSkuCode: string;

    
    hualeiShippingLabelFormatByProducts: HualeiShippingLabelFormatByProduct[];

}
