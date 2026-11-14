import { HualeiShipmentResponseChild } from "./hualei-shipment-response-child";

export interface HualeiShipmentResponse {
    
    id?: number;

    warehouseId: number;

    ack: string;
    attr1: string;
    attr2: string;

    childList: HualeiShipmentResponseChild[];

    delay_type: string;
    is_changenumbers: string;
    is_delay: string;
    is_remote: string;
    is_residential: string;
    message: string;
    order_id: string;
    order_privatecode: string;
    order_transfercode: string;
    orderpricetrial_amount: string;
    orderpricetrial_currency: string;
    post_customername: string;
    product_tracknoapitype: string;
    reference_number: string;
    return_address: string;
    tracking_number: string;

    trackingUrl?: string;
    shippingLabelUrl?: string;

}
