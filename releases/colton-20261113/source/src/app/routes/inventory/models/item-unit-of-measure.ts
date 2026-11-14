import { Client } from '../../common/models/client';
import { Supplier } from '../../common/models/supplier';
import { UnitOfMeasure } from '../../common/models/unit-of-measure';

export interface ItemUnitOfMeasure {
  id? : number;
  client?: Client;
  supplier?: Supplier;
  unitOfMeasureId?: number;
  unitOfMeasure?: UnitOfMeasure;
  quantity?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  warehouseId?: number;
  companyId: number;
  defaultForInboundReceiving?: boolean;
  defaultForWorkOrderReceiving?: boolean;
  trackingLpn?: boolean;
  defaultForDisplay?: boolean;
  caseFlag?: boolean;
  
  weightUnit?: string;
  lengthUnit?: string;
  widthUnit?: string;
  heightUnit?: string;
}
