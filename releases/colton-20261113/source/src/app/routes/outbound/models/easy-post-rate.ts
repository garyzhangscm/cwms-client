export interface EasyPostRate {

    
    carrier: string;
    service: string;
    rate: number;
    currency: string;
    listRate: number;
    listCurrency: string;
    retailRate: number;
    retailCurrency: string;
    deliveryDays: number;

    deliveryDate: string;
    deliveryDateGuaranteed: boolean;
    estDeliveryDays: number;
    shipmentId: string;
    carrierAccountId: string;
    billingType: string; 

}
