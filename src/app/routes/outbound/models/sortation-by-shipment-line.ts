

import { ShipmentLine } from './shipment-line';
import { SortationByShipmentLineHistory } from './sortation-by-shipment-line-history';

export interface SortationByShipmentLine {
  id?: number;
  
  sortationByOrderLineHistories: SortationByShipmentLineHistory[];
 

  shipmentLine: ShipmentLine;
  shipmentId: number;

  expectedQuantity: number;

  arrivedQuantity: number;

  sortedQuantity: number;

  itemName?: string;
  itemId: number;
}