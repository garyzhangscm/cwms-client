import { Item } from '../../inventory/models/item';

export interface ReceiptLine {
  id?: number;
  number?: string;
  item?: Item;
  expectedQuantity?: number;
  receivedQuantity?: number;
  overReceivingQuantity?: number;
  overReceivingPercent?: number;
}
