export interface CustomReportParameter {
    id?: number;
    companyId: number;
    warehouseId: number;

    name: string;
    displayText: string;

    value?: string;
}
