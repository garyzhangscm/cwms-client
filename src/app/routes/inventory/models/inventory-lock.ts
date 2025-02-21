export interface InventoryLock {
    
    id?: number;
    warehouseId: number;


    name: string;
    description: string;


    allowPick: boolean;
    allowShip: boolean;
    enabled: boolean;
}
