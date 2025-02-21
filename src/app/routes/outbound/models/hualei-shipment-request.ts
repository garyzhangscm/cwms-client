import { HualeiShipmentRequestParameters } from "./hualei-shipment-request-parameters";
import { HualeiShipmentRequestStatus } from "./hualei-shipment-request-status.enum";
import { HualeiShipmentResponse } from "./hualei-shipment-response";

export interface HualeiShipmentRequest {
   
    id?: number;

    warehouseId: number;

    getTrackingNumber: string;

    param: HualeiShipmentRequestParameters;
    status: HualeiShipmentRequestStatus;

    shipmentResponse?: HualeiShipmentResponse;

    createdTime?: Date;
}
