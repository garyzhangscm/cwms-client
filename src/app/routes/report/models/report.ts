import { PrintPageOrientation } from "../../common/models/print-page-orientation.enum";
import { Company } from "../../warehouse-layout/models/company";
import { Warehouse } from "../../warehouse-layout/models/warehouse";
import { ReportType } from "./report-type.enum";
import { ReportOrientation } from "./report-orientation.enum";

export interface Report {
    id?: number;
  
  companyId?: number;
  company?: Company;
  warehouseId?: number;
  warehouse?: Warehouse;

  description: string;
  type?: ReportType;
  fileName: string;
  fileUrl?: string;
  reportOrientation: ReportOrientation;



}
