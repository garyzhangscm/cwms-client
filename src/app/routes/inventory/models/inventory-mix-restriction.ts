import { Client } from "../../common/models/client";
import { LocationGroup } from "../../warehouse-layout/models/location-group";
import { LocationGroupType } from "../../warehouse-layout/models/location-group-type";
import { WarehouseLocation } from "../../warehouse-layout/models/warehouse-location";
import { InventoryMixRestrictionLine } from "./inventory-mix-restriction-line";

export interface InventoryMixRestriction {
    
    id?: number;

    warehouseId: number;

    locationGroupTypeId?: number;
    locationGroupType?: LocationGroupType;

    locationGroupId?: number;
    locationGroup?: LocationGroup;

    locationId?: number;
    location?: WarehouseLocation;

    clientId?: number;
    client?: Client;
    
    lines: InventoryMixRestrictionLine[];

    byLPNLines: InventoryMixRestrictionLine[];
    byLocationLines: InventoryMixRestrictionLine[];
}
