import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/guard/auth.guard';
import { WorkOrderBillOfMaterialMaintenanceComponent } from './bill-of-material-maintenance/bill-of-material-maintenance.component';
import { WorkOrderBillOfMaterialComponent } from './bill-of-material/bill-of-material.component';
import { WorkOrderProductionLineComponent } from './production-line/production-line.component';
import { WorkOrderProductionPlanMaintenanceComponent } from './production-plan-maintenance/production-plan-maintenance.component';
import { WorkOrderProductionPlanComponent } from './production-plan/production-plan.component';
import { WorkOrderWorkOrderCompleteByProductComponent } from './work-order-complete-by-product/work-order-complete-by-product.component';
import { WorkOrderWorkOrderCompleteConfirmComponent } from './work-order-complete-confirm/work-order-complete-confirm.component';
import { WorkOrderWorkOrderCompleteKpiComponent } from './work-order-complete-kpi/work-order-complete-kpi.component';
import { WorkOrderWorkOrderCompleteComponent } from './work-order-complete/work-order-complete.component';
import { WorkOrderWorkOrderLineCompleteConfirmComponent } from './work-order-line-complete-confirm/work-order-line-complete-confirm.component';
import { WorkOrderWorkOrderLineCompleteComponent } from './work-order-line-complete/work-order-line-complete.component';
import { WorkOrderWorkOrderLineMaintenanceComponent } from './work-order-line-maintenance/work-order-line-maintenance.component';
import { WorkOrderWorkOrderProduceByProductComponent } from './work-order-produce-by-product/work-order-produce-by-product.component';
import { WorkOrderWorkOrderProduceConfirmComponent } from './work-order-produce-confirm/work-order-produce-confirm.component';
import { WorkOrderWorkOrderProduceKpiComponent } from './work-order-produce-kpi/work-order-produce-kpi.component';
import { WorkOrderWorkOrderProduceComponent } from './work-order-produce/work-order-produce.component';
import { WorkOrderWorkOrderComponent } from './work-order/work-order.component';
import { WorkOrderAssignProductionLineComponent } from './assign-production-line/assign-production-line.component';
import { WorkOrderProductionLineMaintenanceComponent } from './production-line-maintenance/production-line-maintenance.component';
import { WorkOrderMouldComponent } from './mould/mould.component';
import { WorkOrderMouldMaintenanceComponent } from './mould-maintenance/mould-maintenance.component';

const routes: Routes = [
  { path: 'work-order', component: WorkOrderWorkOrderComponent, canActivate: [AuthGuard]  },
  { path: 'production-line', component: WorkOrderProductionLineComponent, canActivate: [AuthGuard]  },
  { path: 'bill-of-material', component: WorkOrderBillOfMaterialComponent, canActivate: [AuthGuard]  },
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
  { path: 'production-plan', component: WorkOrderProductionPlanComponent, canActivate: [AuthGuard]  },
  { path: 'production-plan/maintenance', component: WorkOrderProductionPlanMaintenanceComponent },
  { path: 'work-order/line/maintenance', component: WorkOrderWorkOrderLineMaintenanceComponent },
  { path: 'bill-of-material/maintenance', component: WorkOrderBillOfMaterialMaintenanceComponent },
  { path: 'work-order/assign-production-line', component: WorkOrderAssignProductionLineComponent },
  { path: 'production-line-maintenance', component: WorkOrderProductionLineMaintenanceComponent },
  { path: 'mould', component: WorkOrderMouldComponent },
  { path: 'mould/maintenance', component: WorkOrderMouldMaintenanceComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkOrderRoutingModule { }
