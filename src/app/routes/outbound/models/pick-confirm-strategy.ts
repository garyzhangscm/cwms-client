import { UnitOfMeasure } from "../../common/models/unit-of-measure";
import { Item } from "../../inventory/models/item";
import { ItemFamily } from "../../inventory/models/item-family";
import { LocationGroup } from "../../warehouse-layout/models/location-group";
import { LocationGroupType } from "../../warehouse-layout/models/location-group-type";
import { Warehouse } from "../../warehouse-layout/models/warehouse";
import { WarehouseLocation } from "../../warehouse-layout/models/warehouse-location";

export interface PickConfirmStrategy {
    
    id?: number;
    sequence?: number; 
    warehouseId: number;
    warehouse?: Warehouse;


    itemId?: number;
    item?: Item;


    itemFamilyId?: number;
    itemFamily?: ItemFamily;
    

    locationId?: number;
    location?: WarehouseLocation;

    locationGroupId?: number;
    locationGroup?: LocationGroup;

    locationGroupTypeId?: number;
    locationGroupType?: LocationGroupType;

    unitOfMeasureId?: number;
    unitOfMeasure?: UnitOfMeasure
    

    confirmItemFlag: boolean;
    confirmLocationFlag: boolean;
    confirmLocationCodeFlag: boolean;
    confirmLpnFlag: boolean;
}
