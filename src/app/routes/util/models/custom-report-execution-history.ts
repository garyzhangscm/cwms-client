import { CustomReport } from "./custom-report";
import { CustomReportExecutionStatus } from "./custom-report-execution-status";

export interface CustomReportExecutionHistory {
    
    id?: number;
    companyId: number;
    warehouseId: number;
 
    customReport: CustomReport;
    
    query: string;

    result: boolean;

    resultRowCount: number;

    errorMessage: string;
    resultFile: string;

    resultFileExpired: boolean;

    resultFileExpiredTime: Date;

    status: CustomReportExecutionStatus; 
    customReportExecutionPercent: number;

    resultFileDownloadUrl?: string;
}
