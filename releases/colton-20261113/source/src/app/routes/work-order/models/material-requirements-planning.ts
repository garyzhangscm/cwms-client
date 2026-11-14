import { Item } from "../../inventory/models/item";
import { MasterProductionSchedule } from "./master-production-schedule";
import { MaterialRequirementsPlanningLine } from "./material-requirements-planning-line";
import { ProductionLine } from "./production-line";
 

export interface MaterialRequirementsPlanning {
    
    id?: number;
    warehouseId: number;

    number: string;
    description: string;
    
    itemId: number;

    item?: Item;
    totalRequiredQuantity: number;

    productionLines: ProductionLine[];

    // MPS line on the production line
    masterProductionSchedule: MasterProductionSchedule;
    cutoffDate: Date;

 
    materialRequirementsPlanningLines: MaterialRequirementsPlanningLine[]
 

}
