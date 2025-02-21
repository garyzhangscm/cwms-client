import { WorkOrderLine } from "./work-order-line";
import { WorkOrderLineSparePartDetail } from "./work-order-line-spare-part-detail";

export interface WorkOrderLineSparePart {
    
    id? : number;
    
    name: string;
    description: string;
    
    quantity: number;
    inprocessQuantity: number;
    workOrderLineSparePartDetails: WorkOrderLineSparePartDetail[];
}
