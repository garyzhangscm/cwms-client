import { IntegrationStatus } from "./integration-status.enum";
import { IntegrationWorkOrderByProduct } from "./integration-work-order-by-product";
import { IntegrationWorkOrderInstruction } from "./integration-work-order-instruction";
import { IntegrationWorkOrderLine } from "./integration-work-order-line";

export interface IntegrationWorkOrder {
    
    id: number;

    number: string;

    companyId: number;
    companyCode: string;
    warehouseName: string;
    warehouseId: number;


    itemId: number;
    itemName: string;

    poNumber: string;

    expectedQuantity: number;

    workOrderLines: IntegrationWorkOrderLine[];
    workOrderInstructions: IntegrationWorkOrderInstruction[];
    workOrderByProduct: IntegrationWorkOrderByProduct[];


    status: IntegrationStatus;
    
    errorMessage: string;
    
    createdTime:  Date;
    createdBy: string;
    lastModifiedTime:  Date;
    lastModifiedBy: string;

}
