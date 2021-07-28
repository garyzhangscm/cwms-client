import { ReportType } from "./report-type.enum";

export interface ReportPrinterConfiguration {

    id?: number;

    warehouseId: number;
    reportType?: ReportType;
    criteriaValue: string;
    printerName: string;

    copies: number;

}
