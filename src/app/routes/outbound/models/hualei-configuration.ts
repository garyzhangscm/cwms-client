import { HualeiShippingLabelFormatByProduct } from "./hualei-shipping-label-format-by-product";

export interface HualeiConfiguration {
    
    id?: number;

    warehouseId: number;
    customerId: string;
    customerUserid: string;

    
    createOrderProtocol: string;
    createOrderHost: string;
    createOrderPort: string;
    createOrderEndpoint: string;

    printLabelProtocol: string;
    printLabelHost: string;
    printLabelPort: string;
    printLabelEndpoint: string;  
    
    getPackageStatusProtocol: string;
    getPackageStatusHost: string;
    getPackageStatusPort: string;
    getPackageStatusEndpoint: string;
    
    getTrackingNumberProtocol: string;
    getTrackingNumberHost: string;
    getTrackingNumberPort: string;
    getTrackingNumberEndpoint: string;

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

    weightUnit: string;
    lengthUnit: string;
    
    hualeiShippingLabelFormatByProducts: HualeiShippingLabelFormatByProduct[];

}
