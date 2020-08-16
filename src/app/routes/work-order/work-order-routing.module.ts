import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkOrderWorkOrderComponent } from './work-order/work-order.component';
import { WorkOrderProductionLineComponent } from './production-line/production-line.component';
import { WorkOrderBillOfMaterialComponent } from './bill-of-material/bill-of-material.component';
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

const routes: Routes = [
  { path: 'work-order', component: WorkOrderWorkOrderComponent },
  { path: 'production-line', component: WorkOrderProductionLineComponent },
  { path: 'bill-of-material', component: WorkOrderBillOfMaterialComponent },
  { path: 'work-order/produce', component: WorkOrderWorkOrderProduceComponent },
  { path: 'work-order/produce/by-product', component: WorkOrderWorkOrderProduceByProductComponent },
  { path: 'work-order/produce/kpi', component: WorkOrderWorkOrderProduceKpiComponent },
  { path: 'work-order/produce/confirm', component: WorkOrderWorkOrderProduceConfirmComponent },
  { path: 'work-order/line/complete', component: WorkOrderWorkOrderLineCompleteComponent },
  { path: 'work-order/line/complete/confirm', component: WorkOrderWorkOrderLineCompleteConfirmComponent },
  { path: 'work-order/complete', component: WorkOrderWorkOrderCompleteComponent },
  { path: 'work-order/complete/by-product', component: WorkOrderWorkOrderCompleteByProductComponent },
  { path: 'work-order/complete/kpi', component: WorkOrderWorkOrderCompleteKpiComponent },
  { path: 'work-order/complete/confirm', component: WorkOrderWorkOrderCompleteConfirmComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkOrderRoutingModule {}
