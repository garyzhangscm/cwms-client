import { OrderStatus } from "./order-status.enum";

export interface OutboundConfiguration {
    id?: number;
    warehouseId: number; 
    shortAutoReallocation: boolean;
    asynchronousAllocation: boolean;
    asynchronousAllocationPalletThreshold: number;

    maxPalletSize: number;
    maxPalletHeight: number;

    
    statusAllowOrderChangeWhenUploadFile?: OrderStatus;
    statusAllowOrderChangeFromIntegration?: OrderStatus;
    statusAllowOrderChangeFromWebUI?: OrderStatus;

    completeOrderAndShipmentWhenCompleteWave: boolean
 
}
