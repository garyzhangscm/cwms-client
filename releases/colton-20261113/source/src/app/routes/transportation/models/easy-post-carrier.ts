import { ReportType } from "../../report/models/report-type.enum";
import { Carrier } from "./carrier";

export interface EasyPostCarrier {
    
    id?: number;

    warehouseId: number;

    carrierId: number;
    carrier?: Carrier;
    accountNumber: string;

    reportType: ReportType;
    printerName?: string;

    printParcelLabelAfterManifestFlag: boolean;
    labelCopyCount?: number;
    schedulePickupAfterManifestFlag: boolean;
    
    minPickupTime?: string;
    maxPickupTime?: string;
 
}
