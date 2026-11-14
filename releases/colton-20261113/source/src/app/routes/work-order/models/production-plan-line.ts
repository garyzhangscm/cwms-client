import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { OrderLine } from '../../outbound/models/order-line';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { BillOfMaterial } from './bill-of-material';

export interface ProductionPlanLine {
  id?: number;

  orderLineId?: number;
  orderLine?: OrderLine;
  itemId?: number;
  item?: Item;
  billOfMaterial?: BillOfMaterial;
  warehouseId?: number;
  warehouse?: Warehouse;

  expectedQuantity?: number;
  inprocessQuantity?: number;
  producedQuantity?: number;

  inventoryStatusId?: number;
  inventoryStatus?: InventoryStatus;
}
