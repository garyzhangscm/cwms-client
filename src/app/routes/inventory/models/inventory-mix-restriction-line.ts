import { InventoryMixRestrictionAttribute } from "./inventory-mix-restriction-attribute";
import { InventoryMixRestrictionLineType } from "./inventory-mix-restriction-line-type";

export interface InventoryMixRestrictionLine {
    id? : number; 

    type?:  InventoryMixRestrictionLineType;


    attribute?: InventoryMixRestrictionAttribute;
}
