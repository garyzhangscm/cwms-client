

import { Item } from '../../inventory/models/item';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { BillOfMaterialByProduct } from './bill-of-material-by-product';
import { BillOfMaterialLine } from './bill-of-material-line';
import { WorkOrderInstructionTemplate } from './work-order-instruction-template';

export interface BillOfMaterial {
  id?: number;
  number?: string;
  description?: string;
  billOfMaterialLines: BillOfMaterialLine[];
  workOrderInstructionTemplates: WorkOrderInstructionTemplate[];
  billOfMaterialByProducts: BillOfMaterialByProduct[];

  itemId?: number;
  item?: Item;
  expectedQuantity?: number;
  warehouseId?: number;
  warehouse?: Warehouse;
}
