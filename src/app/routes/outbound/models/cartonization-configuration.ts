import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { Client } from '../../common/models/client';
import { PickType } from './pick-type.enum';
import { CartonizationGroupRule } from './cartonization-group-rule.enum';

export interface CartonizationConfiguration {
  id: number;
  sequence: number;
  warehouseId: number;
  warehouse: Warehouse;

  clientId: number;
  client: Client;

  pickType: PickType;
  groupRules: CartonizationGroupRule[];

  enabled: boolean;
}
