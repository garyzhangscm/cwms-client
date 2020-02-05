import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkOrderWorkOrderComponent } from './work-order/work-order.component';
import { WorkOrderProductionLineComponent } from './production-line/production-line.component';
import { WorkOrderBillOfMaterialComponent } from './bill-of-material/bill-of-material.component';

const routes: Routes = [

  { path: 'work-order', component: WorkOrderWorkOrderComponent },
  { path: 'production-line', component: WorkOrderProductionLineComponent },
  { path: 'bill-of-material', component: WorkOrderBillOfMaterialComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkOrderRoutingModule { }
