export interface OutboundConfiguration {
    id?: number;
    warehouseId: number; 
    shortAutoReallocation: boolean;
    asynchronousAllocation: boolean;
    asynchronousAllocationPalletThreshold: number;

    maxPalletSize: number;
    maxPalletHeight: number;
 
}
