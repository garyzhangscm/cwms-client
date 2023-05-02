import { HualeiShipmentRequestParameters } from "./hualei-shipment-request-parameters";
import { HualeiShipmentResponse } from "./hualei-shipment-response";

export interface HualeiShipmentRequest {
   
    id?: number;

    warehouseId: number;

    getTrackingNumber: string;

    param: HualeiShipmentRequestParameters;

    shipmentResponse?: HualeiShipmentResponse;

    createdTime?: Date;
}
