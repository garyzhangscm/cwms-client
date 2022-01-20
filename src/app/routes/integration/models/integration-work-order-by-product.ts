import { IntegrationStatus } from "./integration-status.enum";

export interface IntegrationWorkOrderByProduct {
    id: number;

    itemId: number;
    itemName: string;


    companyId: number;
    companyCode: string;
    warehouseName: string;
    warehouseId: number;

    expectedQuantity: number;

    inventoryStatusId: number;
    inventoryStatusName: string;
 

    status: IntegrationStatus;
    errorMessage: string;
}
