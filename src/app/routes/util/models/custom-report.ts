import { CustomReportParameter } from "./custom-report-parameter";

export interface CustomReport {
    
   
    id?: number;
    companyId: number;
    warehouseId: number;

    name: string;
    description?: string;
    
    runAtCompanyLevel: boolean;
 
    query: string;

    customReportParameters: CustomReportParameter[];
    
    companyIdFieldName?: string;
    warehouseIdFieldName?: string;

    
    groupBy?: string;
    sortBy?: string;
}
