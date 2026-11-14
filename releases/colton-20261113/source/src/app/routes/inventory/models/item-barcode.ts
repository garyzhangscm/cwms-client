import { ItemBarcodeType } from "./item-barcode-type";

 

export interface ItemBarcode {
  id?: number;
  
  warehouseId: number;

  code: string;
  itemBarcodeType: ItemBarcodeType;
}
