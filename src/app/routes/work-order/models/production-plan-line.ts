import { OrderLine } from '../../outbound/models/order-line';
import { Item } from '../../inventory/models/item';
import { BillOfMaterial } from './bill-of-material';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Warehouse } from '../../warehouse-layout/models/warehouse';

export interface ProductionPlanLine {
  id: number;

  orderLineId: number;
  orderLine: OrderLine;
  itemId: number;
  item: Item;
  billOfMaterial: BillOfMaterial;
  warehouseId: number;
  warehouse: Warehouse;

  expectedQuantity: number;
  inprocessQuantity: number;
  producedQuantity: number;

  inventoryStatusId: number;
  inventoryStatus: InventoryStatus;
}
