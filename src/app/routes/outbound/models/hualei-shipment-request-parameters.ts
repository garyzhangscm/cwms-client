import { HualeiShipmentRequestOrderInvoiceParameters } from "./hualei-shipment-request-order-invoice-parameters";
import { HualeiShipmentRequestOrderVolumeParameters } from "./hualei-shipment-request-order-volume-parameters";

export interface HualeiShipmentRequestParameters {
    
    id?: number;

    warehouseId: number;

    cargo_type: string;
    consignee_address: string;
    consignee_city: string;
    consignee_name: string;
    consignee_postcode: string;
    consignee_state: string;
    consignee_telephone: string;
    country: string;
    customer_id: string;
    customer_userid: string;
    customs_clearance: string;
    customs_declaration: string;
    duty_type: string;
    from: string;
    is_fba: string;
    order_customerinvoicecode: string;
    order_piece: number;
    order_returnsign: string;
    product_id: string;
    weight: number;
    weight_unit: string;
    orderVolumeParam: HualeiShipmentRequestOrderVolumeParameters[];
    orderInvoiceParam: HualeiShipmentRequestOrderInvoiceParameters[];
}
