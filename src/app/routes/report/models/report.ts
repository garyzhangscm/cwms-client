import { ReportType } from "./report-type.enum";

export interface Report {
  id: number;
  name: string;
  
  companyId: number;
  warehouseId: number;

  description: string;
  type: ReportType;
  fileName: string;
}