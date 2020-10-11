import { Item } from './item';
import { Client } from '../../common/models/client';
import { ItemFamily } from './item-family';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { InventoryQuantityChangeType } from './inventory-quantity-change-type.enum';

import { Role } from '../../auth/models/role';
import { User } from '../../auth/models/user';

export interface InventoryAdjustmentThreshold {
  id: number;

  // criteria
  item: Item;
  clientId: number;
  client: Client;
  itemFamily: ItemFamily;
  warehouseId: number;
  warehouse: Warehouse;
  type: InventoryQuantityChangeType;
  userId: number;
  user: User;
  roleId: number;
  role: Role;

  // Threshold
  quantityThreshold: number;
  costThreshold: number;
  enabled: boolean;
}
