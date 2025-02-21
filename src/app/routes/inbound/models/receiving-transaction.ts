 
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { ItemPackageType } from '../../inventory/models/item-package-type'; 
import { ReceivingTransactionType } from './receiving-transaction-type.enum';

export interface ReceivingTransaction {
  
  id: number;
  
  warehouseId: number;

  type: ReceivingTransactionType;


  lpn: string;


  itemId: number;
  item?: Item;
  quantity: number;

  username: string;
  rfCode?: string;

  color?: string;

  productSize?: string;

  style?: string;


  itemPackageTypeId: number;
  itemPackageType?: ItemPackageType;

  inventoryAttribute1?: string;
  inventoryAttribute2?: string;
  inventoryAttribute3?: string;
  inventoryAttribute4?: string;
  inventoryAttribute5?: string;

  inventoryStatusId: number;
  inventoryStatus?: InventoryStatus;
}
