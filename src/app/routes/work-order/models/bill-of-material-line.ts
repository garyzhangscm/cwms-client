import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { BillOfMaterial } from './bill-of-material';

export interface BillOfMaterialLine {
  id?: number;
  number?: string;
  billOfMaterial?: BillOfMaterial;

  itemId?: number;
  item?: Item;
  expectedQuantity?: number;

  inventoryStatusId?: number;
  inventoryStatus?: InventoryStatus;
}
