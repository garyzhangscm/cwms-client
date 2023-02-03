import { UnitOfMeasure } from "../../common/models/unit-of-measure";
 

export interface ItemDefaultPackageUOM {
    id?: number;

    unitOfMeasureId?: number;
    unitOfMeasure?: UnitOfMeasure;
    quantity?: number;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    
    defaultForInboundReceiving?: boolean;
    defaultForWorkOrderReceiving?: boolean;
    trackingLpn?: boolean;
  
    
    weightUnit?: string;
    lengthUnit?: string;
    widthUnit?: string;
    heightUnit?: string;
    
    caseFlag?: boolean;
}
