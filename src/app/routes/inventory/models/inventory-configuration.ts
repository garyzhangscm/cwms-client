import { Company } from "../../warehouse-layout/models/company";
import { Warehouse } from "../../warehouse-layout/models/warehouse";
import { InventoryConfigurationType } from "./inventory-configuration-type";

export interface InventoryConfiguration {
    id: number;

    companyId: number;

    company: Company;

    warehouseId: number;
    warehouse: Warehouse;

    type: InventoryConfigurationType;


    integerValue: number;
    longValue: number;

    doubleValue: number;

    stringValue: String;
}
