import { ItemUnitOfMeasure } from './item-unit-of-measure';

export interface ItemPackageType {
  id?: number;
  name?: string;
  description?: string;
  itemUnitOfMeasures: ItemUnitOfMeasure[];
  warehouseId?: number;
  companyId: number;
  stockItemUnitOfMeasure? : ItemUnitOfMeasure;
  caseItemUnitOfMeasure? : ItemUnitOfMeasure;
  displayItemUnitOfMeasure? : ItemUnitOfMeasure;
  defaultInboundReceivingUOM? : ItemUnitOfMeasure;
  defaultWorkOrderReceivingUOM? : ItemUnitOfMeasure;
  trackingLpnUOM? : ItemUnitOfMeasure;
}
