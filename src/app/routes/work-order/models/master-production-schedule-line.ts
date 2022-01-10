import { MasterProductionScheduleLineDate } from "./master-production-schedule-line-date";
import { ProductionLine } from "./production-line";

export interface MasterProductionScheduleLine {

    id: number;
    number: string;
    

    quantity: number;
    productionLine: ProductionLine;

    masterProductionScheduleLineDates: MasterProductionScheduleLineDate[];


}
