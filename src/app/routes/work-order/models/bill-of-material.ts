import { BillOfMaterialLine } from './bill-of-material-line';

import { WorkOrderInstructionTemplate } from './work-order-instruction-template';

import { Item } from '../../inventory/models/item';

export interface BillOfMaterial {
  id: number;
  number: string;
  billOfMaterialLines: BillOfMaterialLine[];
  workOrderInstructionTemplates: WorkOrderInstructionTemplate[];

  itemId: number;
  item?: Item;
  expectedQuantity: number;
}
