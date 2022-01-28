import { Item } from "../../inventory/models/item";
import { BillOfMaterial } from "./bill-of-material";
 

export interface MaterialRequirementsPlanningLine {
    
    id?: number;
    warehouseId: number;

    itemId?: number;
    item?: Item;


    parentMRPLineId?: number;
    billOfMaterial?: BillOfMaterial;

    children: MaterialRequirementsPlanningLine[];

    totalRequiredQuantity: number;
    requiredQuantity: number;
    expectedInventoryOnHand: number;
    expectedReceiveQuantity: number;
    expectedOrderQuantity: number;
    expectedWorkOrderQuantity: number;
    

}
