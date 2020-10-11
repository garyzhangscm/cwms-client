import { BillOfMaterial } from './bill-of-material';

export interface WorkOrderInstructionTemplate {
  id?: number;
  billOfMaterial?: BillOfMaterial;
  sequence?: number;
  instruction?: string;
}
