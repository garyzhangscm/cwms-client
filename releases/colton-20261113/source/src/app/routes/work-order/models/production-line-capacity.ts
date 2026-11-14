import { TimeUnit } from "../../common/models/time-unit.enum";
import { UnitOfMeasure } from "../../common/models/unit-of-measure";
import { Item } from "../../inventory/models/item";
import { Warehouse } from "../../warehouse-layout/models/warehouse";
import { Mould } from "./mould";
import { ProductionLine } from "./production-line";

export interface ProductionLineCapacity {
    id?: number;
    
    warehouseId?: number;
    
    warehouse?: Warehouse;

    itemId?: number;

    item?: Item;

    mould?: Mould;

    capacity?: number;
    unitOfMeasure?: UnitOfMeasure;
    unitOfMeasureId?: number;

    capacityUnit?: TimeUnit;
    staffCount?: number;
}
