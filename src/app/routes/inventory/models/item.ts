import { ABCCategory } from '../../common/models/abc-category';
import { Client } from '../../common/models/client';
import { Velocity } from '../../common/models/velocity';
import { BillOfMaterial } from '../../work-order/models/bill-of-material';
import { AllocationRoundUpStrategyType } from './allocation-round-up-strategy-type.enum';
import { ItemBarcode } from './item-barcode';
import { ItemFamily } from './item-family';
import { ItemPackageType } from './item-package-type';
import { ItemUnitOfMeasure } from './item-unit-of-measure';

export interface Item {
  id?: number;
  name: string;
  description: string;
  clientId?: number;
  client?: Client;
  itemFamily?: ItemFamily;
  itemPackageTypes: ItemPackageType[];
  itemBarcodes?: ItemBarcode[];
  defaultItemPackageType? : ItemPackageType
  allowCartonization?: boolean;
  unitCost?: number;
  allowAllocationByLPN?: boolean;
  allocationRoundUpStrategyType?: AllocationRoundUpStrategyType;

  allocationRoundUpStrategyValue?: number;

  trackingVolumeFlag?: boolean;
  trackingLotNumberFlag?: boolean;
  trackingManufactureDateFlag?: boolean;
  shelfLifeDays?: number;
  trackingExpirationDateFlag?: boolean;

  
  trackingColorFlag?: boolean;
  defaultColor?: string;

  trackingProductSizeFlag?: boolean;
  defaultProductSize?: string;

  trackingStyleFlag?: boolean;
  defaultStyle?: string;
  
  trackingInventoryAttribute1Flag ?: boolean;
  defaultInventoryAttribute1?: string;

  trackingInventoryAttribute2Flag?: boolean;
  defaultInventoryAttribute2?: string;

  trackingInventoryAttribute3Flag?: boolean;
  defaultInventoryAttribute3?: string;

  trackingInventoryAttribute4Flag?: boolean;
  defaultInventoryAttribute4?: string;

  trackingInventoryAttribute5Flag?: boolean;
  defaultInventoryAttribute5?: string;


  warehouseId?: number;
  companyId: number;

  imageUrl?: string;
  image?: string;
  thumbnailUrl?: string;
  thumbnail?: string;

  
  workOrderSOPUrl?: string;
  workOrderSOP?: string;

  abcCategoryId?: number;
  abcCategory?: ABCCategory;
  velocityId?: number;
  velocity?: Velocity;

  receivingRateByUnit?: number;
  shippingRateByUnit?: number;
  handlingRateByUnit?: number;

  // for kit item, the parent - children
  // relationship will be maintained by the
  // bill of material
  kitItemFlag?: boolean;
  billOfMaterialId?: number;
  kitInnerItems?: Item[];
  billOfMaterial?: BillOfMaterial;
}
