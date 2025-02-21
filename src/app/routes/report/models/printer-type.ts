import { Company } from "../../warehouse-layout/models/company";

export interface PrinterType {
    
    id?: number;

    companyId: number;
    company?: Company;

    name: string;
    description: string;
}
