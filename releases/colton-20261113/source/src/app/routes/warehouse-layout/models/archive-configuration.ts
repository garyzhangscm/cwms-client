export interface ArchiveConfiguration {
    id?: number;
    warehouseId: number; 
    inventoryArchiveEnabled: boolean; 
    removedInventoryArchiveDays: number;
}
