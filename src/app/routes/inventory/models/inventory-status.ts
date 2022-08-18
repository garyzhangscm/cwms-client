export interface InventoryStatus {
  id?: number;
  warehouseId: number;
  name: string;
  description: string;
  availableStatusFlag?: boolean;
}
