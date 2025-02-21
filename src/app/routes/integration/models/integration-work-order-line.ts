import { AllocationStrategyType } from "../../outbound/models/allocation-strategy-type.enum";
import { IntegrationStatus } from "./integration-status.enum";

export interface IntegrationWorkOrderLine {
    
    id: number;

    number: string;

    itemId: number;
    itemName: string;


    companyId: number;
    companyCode: string;

    warehouseName: string;
    warehouseId: number;

    expectedQuantity: number;

    inventoryStatusId: number;
    inventoryStatusName: string;
 
    allocationStrategyType: AllocationStrategyType;


    status: IntegrationStatus;
    errorMessage: string;
}
