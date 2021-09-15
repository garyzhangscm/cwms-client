export interface BillableRequestSummaryByCompany {
    
    companyId: number;
    serviceName: string;
    
    totalWebAPIEndpointCall: number;
    totalTransaction : number;
    overallCost: number;

}
