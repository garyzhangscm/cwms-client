import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { WorkOrderRoutingModule } from './work-order-routing.module';
import { WorkOrderWorkOrderComponent } from './work-order/work-order.component';
import { WorkOrderProductionLineComponent } from './production-line/production-line.component';
import { WorkOrderBillOfMaterialComponent } from './bill-of-material/bill-of-material.component';
import { DirectivesModule } from '../directives/directives.module';

const COMPONENTS = [WorkOrderWorkOrderComponent, WorkOrderProductionLineComponent, WorkOrderBillOfMaterialComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [SharedModule, WorkOrderRoutingModule, DirectivesModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT,
})
export class WorkOrderModule {}
