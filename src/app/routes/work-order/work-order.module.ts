import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { WorkOrderRoutingModule } from './work-order-routing.module';
import { WorkOrderWorkOrderComponent } from './work-order/work-order.component';
import { WorkOrderProductionLineComponent } from './production-line/production-line.component';
import { WorkOrderBillOfMaterialComponent } from './bill-of-material/bill-of-material.component';
import { DirectivesModule } from '../directives/directives.module';
import { WorkOrderWorkOrderProduceComponent } from './work-order-produce/work-order-produce.component';
import { WorkOrderWorkOrderProduceConfirmComponent } from './work-order-produce-confirm/work-order-produce-confirm.component';
import { WorkOrderWorkOrderCompleteComponent } from './work-order-complete/work-order-complete.component';
import { WorkOrderWorkOrderLineCompleteComponent } from './work-order-line-complete/work-order-line-complete.component';
import { WorkOrderWorkOrderLineCompleteConfirmComponent } from './work-order-line-complete-confirm/work-order-line-complete-confirm.component';
import { WorkOrderWorkOrderCompleteConfirmComponent } from './work-order-complete-confirm/work-order-complete-confirm.component';
import { WorkOrderWorkOrderCompleteKpiComponent } from './work-order-complete-kpi/work-order-complete-kpi.component';
import { WorkOrderWorkOrderCompleteByProductComponent } from './work-order-complete-by-product/work-order-complete-by-product.component';
import { WorkOrderWorkOrderProduceKpiComponent } from './work-order-produce-kpi/work-order-produce-kpi.component';
import { WorkOrderWorkOrderProduceByProductComponent } from './work-order-produce-by-product/work-order-produce-by-product.component';
import { WorkOrderProductionPlanComponent } from './production-plan/production-plan.component';
import { WorkOrderProductionPlanMaintenanceComponent } from './production-plan-maintenance/production-plan-maintenance.component';
import { WorkOrderWorkOrderLineMaintenanceComponent } from './work-order-line-maintenance/work-order-line-maintenance.component';
import { WorkOrderBillOfMaterialMaintenanceComponent } from './bill-of-material-maintenance/bill-of-material-maintenance.component';

const COMPONENTS = [
  WorkOrderWorkOrderComponent,
  WorkOrderProductionLineComponent,
  WorkOrderBillOfMaterialComponent,
  WorkOrderWorkOrderProduceComponent,
  WorkOrderWorkOrderProduceConfirmComponent,
  WorkOrderWorkOrderCompleteComponent,
  WorkOrderWorkOrderLineCompleteComponent,
  WorkOrderWorkOrderLineCompleteConfirmComponent,
  WorkOrderWorkOrderCompleteConfirmComponent,
  WorkOrderWorkOrderCompleteKpiComponent,
  WorkOrderWorkOrderCompleteByProductComponent,
  WorkOrderWorkOrderProduceKpiComponent,
  WorkOrderWorkOrderProduceByProductComponent,
  WorkOrderProductionPlanComponent,
  WorkOrderProductionPlanMaintenanceComponent,
  WorkOrderWorkOrderLineMaintenanceComponent,
  WorkOrderBillOfMaterialMaintenanceComponent,
];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [SharedModule, WorkOrderRoutingModule, DirectivesModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT,
})
export class WorkOrderModule {}
