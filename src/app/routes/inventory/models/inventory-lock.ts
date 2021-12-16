export interface InventoryLock {
    
    id?: number;
    warehouseId: number;


    name: String;
    description: String;


    allowPick: boolean;
    allowShip: boolean;
    enabled: boolean;
}
