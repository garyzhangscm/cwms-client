import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/guard/auth.guard';
import { WorkOrderAssignProductionLineComponent } from './assign-production-line/assign-production-line.component';
import { WorkOrderBillOfMaterialMaintenanceComponent } from './bill-of-material-maintenance/bill-of-material-maintenance.component';
import { WorkOrderBillOfMaterialComponent } from './bill-of-material/bill-of-material.component';
import { WorkOrderDeassignProductionLineComponent } from './deassign-production-line/deassign-production-line.component';
import { WorkOrderLaborActivityComponent } from './labor-activity/labor-activity.component';
import { WorkOrderLaborComponent } from './labor/labor.component';
import { WorkOrderMouldMaintenanceComponent } from './mould-maintenance/mould-maintenance.component';
import { WorkOrderMouldComponent } from './mould/mould.component';
import { WorkOrderPrePrintLpnLabelComponent } from './pre-print-lpn-label/pre-print-lpn-label.component';
import { WorkOrderProduceTransactionComponent } from './produce-transaction/produce-transaction.component';
import { WorkOrderProductionKanbanComponent } from './production-kanban/production-kanban.component';
import { WorkOrderProductionLineMaintenanceComponent } from './production-line-maintenance/production-line-maintenance.component';
import { WorkOrderProductionLineComponent } from './production-line/production-line.component';
import { WorkOrderProductionPlanMaintenanceComponent } from './production-plan-maintenance/production-plan-maintenance.component';
import { WorkOrderProductionPlanComponent } from './production-plan/production-plan.component';
import { WorkOrderQcRuleConfigurationMaintenanceComponent } from './qc-rule-configuration-maintenance/qc-rule-configuration-maintenance.component';
import { WorkOrderQcRuleConfigurationComponent } from './qc-rule-configuration/qc-rule-configuration.component';
import { WorkOrderWorkOrderCompleteByProductComponent } from './work-order-complete-by-product/work-order-complete-by-product.component';
import { WorkOrderWorkOrderCompleteConfirmComponent } from './work-order-complete-confirm/work-order-complete-confirm.component';
import { WorkOrderWorkOrderCompleteKpiComponent } from './work-order-complete-kpi/work-order-complete-kpi.component';
import { WorkOrderWorkOrderCompleteComponent } from './work-order-complete/work-order-complete.component';
import { WorkOrderWorkOrderConfigurationComponent } from './work-order-configuration/work-order-configuration.component';
import { WorkOrderWorkOrderLineCompleteConfirmComponent } from './work-order-line-complete-confirm/work-order-line-complete-confirm.component';
import { WorkOrderWorkOrderLineCompleteComponent } from './work-order-line-complete/work-order-line-complete.component';
import { WorkOrderWorkOrderLineMaintenanceComponent } from './work-order-line-maintenance/work-order-line-maintenance.component';
import { WorkOrderWorkOrderProduceByProductComponent } from './work-order-produce-by-product/work-order-produce-by-product.component';
import { WorkOrderWorkOrderProduceConfirmComponent } from './work-order-produce-confirm/work-order-produce-confirm.component';
import { WorkOrderWorkOrderProduceKpiComponent } from './work-order-produce-kpi/work-order-produce-kpi.component';
import { WorkOrderWorkOrderProduceComponent } from './work-order-produce/work-order-produce.component';
import { WorkOrderWorkOrderQcInspectionOperationComponent } from './work-order-qc-inspection-operation/work-order-qc-inspection-operation.component';
import { WorkOrderWorkOrderQcInspectionResultComponent } from './work-order-qc-inspection-result/work-order-qc-inspection-result.component';
import { WorkOrderWorkOrderQcInspectionComponent } from './work-order-qc-inspection/work-order-qc-inspection.component'; 
import { WorkOrderWorkOrderQcSampleMaintenanceComponent } from './work-order-qc-sample-maintenance/work-order-qc-sample-maintenance.component'; 
import { WorkOrderWorkOrderComponent } from './work-order/work-order.component';

const routes: Routes = [
  { path: 'work-order', component: WorkOrderWorkOrderComponent, canActivate: [AuthGuard] },
  { path: 'production-line', component: WorkOrderProductionLineComponent, canActivate: [AuthGuard] },
  { path: 'bill-of-material', component: WorkOrderBillOfMaterialComponent, canActivate: [AuthGuard] },
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
  { path: 'production-plan', component: WorkOrderProductionPlanComponent, canActivate: [AuthGuard] },
  { path: 'production-plan/maintenance', component: WorkOrderProductionPlanMaintenanceComponent },
  { path: 'work-order/line/maintenance', component: WorkOrderWorkOrderLineMaintenanceComponent },
  { path: 'bill-of-material/maintenance', component: WorkOrderBillOfMaterialMaintenanceComponent },
  { path: 'work-order/assign-production-line', component: WorkOrderAssignProductionLineComponent },
  { path: 'production-line-maintenance', component: WorkOrderProductionLineMaintenanceComponent },
  { path: 'mould', component: WorkOrderMouldComponent },
  { path: 'mould/maintenance', component: WorkOrderMouldMaintenanceComponent },
  { path: 'production-kanban', component: WorkOrderProductionKanbanComponent },
  { path: 'work-order/deassign-production-line', component: WorkOrderDeassignProductionLineComponent },
  { path: 'work-order-configuration', component: WorkOrderWorkOrderConfigurationComponent },
  { path: 'produce-transaction', component: WorkOrderProduceTransactionComponent },
  { path: 'pre-print-lpn-label', component: WorkOrderPrePrintLpnLabelComponent },
  { path: 'qc-sample-maintenance', component: WorkOrderWorkOrderQcSampleMaintenanceComponent },
  { path: 'work-order-qc-inspection', component: WorkOrderWorkOrderQcInspectionComponent },
  { path: 'work-order-qc-inspection-operation', component: WorkOrderWorkOrderQcInspectionOperationComponent },
  { path: 'qc-inspection-result', component: WorkOrderWorkOrderQcInspectionResultComponent } ,
  { path: 'qc-rule-configuration', component: WorkOrderQcRuleConfigurationComponent },
  { path: 'qc-rule-configuration/maintenance', component: WorkOrderQcRuleConfigurationMaintenanceComponent },
  { path: 'labor', component: WorkOrderLaborComponent },
  { path: 'labor-activity', component: WorkOrderLaborActivityComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkOrderRoutingModule { }
