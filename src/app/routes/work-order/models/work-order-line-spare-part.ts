import { WorkOrderLine } from "./work-order-line";
import { WorkOrderLineSparePartDetail } from "./work-order-line-spare-part-detail";

export interface WorkOrderLineSparePart {
    
    id? : number;
    workOrderLine: WorkOrderLine;
    
    name: string;
    description: string;
    
    quantity: number;
    workOrderLineSparePartDetails: WorkOrderLineSparePartDetail[];
}
