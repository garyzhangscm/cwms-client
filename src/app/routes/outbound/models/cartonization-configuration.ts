import { Client } from '../../common/models/client';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { CartonizationGroupRule } from './cartonization-group-rule.enum';
import { PickType } from './pick-type.enum';

export interface CartonizationConfiguration {
  id?: number;
  sequence?: number;
  warehouseId?: number;
  warehouse?: Warehouse;

  clientId?: number;
  client?: Client;

  pickType?: PickType;
  groupRules: CartonizationGroupRule[];

  enabled?: boolean;
}
