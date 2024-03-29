import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ACLGuard, ACLGuardType } from '@delon/acl';

import { AuthGuard } from '../auth/guard/auth.guard';
import { WorkOrderAssignProductionLineComponent } from './assign-production-line/assign-production-line.component';
import { WorkOrderBillOfMaterialMaintenanceComponent } from './bill-of-material-maintenance/bill-of-material-maintenance.component';
import { WorkOrderBillOfMaterialComponent } from './bill-of-material/bill-of-material.component';
import { WorkOrderDeassignProductionLineComponent } from './deassign-production-line/deassign-production-line.component';
import { WorkOrderLaborActivityComponent } from './labor-activity/labor-activity.component';
import { WorkOrderLaborComponent } from './labor/labor.component';
import { WorkOrderMouldMaintenanceComponent } from './mould-maintenance/mould-maintenance.component';
import { WorkOrderMouldComponent } from './mould/mould.component';
import { WorkOrderMpsExportComponent } from './mps-export/mps-export.component';
import { WorkOrderMpsMaintenanceComponent } from './mps-maintenance/mps-maintenance.component';
import { WorkOrderMpsViewComponent } from './mps-view/mps-view.component';
import { WorkOrderMpsComponent } from './mps/mps.component';
import { WorkOrderMrpMaintenanceComponent } from './mrp-maintenance/mrp-maintenance.component';
import { WorkOrderMrpComponent } from './mrp/mrp.component';
import { WorkOrderPrePrintLpnLabelComponent } from './pre-print-lpn-label/pre-print-lpn-label.component';
import { WorkOrderProduceTransactionComponent } from './produce-transaction/produce-transaction.component';
import { WorkOrderProductionKanbanComponent } from './production-kanban/production-kanban.component';
import { WorkOrderProductionLineDashboardComponent } from './production-line-dashboard/production-line-dashboard.component';
import { WorkOrderProductionLineMaintenanceComponent } from './production-line-maintenance/production-line-maintenance.component';
import { WorkOrderProductionLineMonitorMaintenanceComponent } from './production-line-monitor-maintenance/production-line-monitor-maintenance.component';
import { WorkOrderProductionLineMonitorTransactionComponent } from './production-line-monitor-transaction/production-line-monitor-transaction.component';
import { WorkOrderProductionLineMonitorComponent } from './production-line-monitor/production-line-monitor.component';
import { WorkOrderProductionLineStatusDisplayComponent } from './production-line-status-display/production-line-status-display.component';
import { WorkOrderProductionLineStatusComponent } from './production-line-status/production-line-status.component';
import { WorkOrderProductionLineComponent } from './production-line/production-line.component';
import { WorkOrderProductionPlanMaintenanceComponent } from './production-plan-maintenance/production-plan-maintenance.component';
import { WorkOrderProductionPlanComponent } from './production-plan/production-plan.component';
import { WorkOrderQcRuleConfigurationMaintenanceComponent } from './qc-rule-configuration-maintenance/qc-rule-configuration-maintenance.component';
import { WorkOrderQcRuleConfigurationComponent } from './qc-rule-configuration/qc-rule-configuration.component';
import { WorkOrderSiloConfigurationComponent } from './silo-configuration/silo-configuration.component';
import { WorkOrderSiloMonitorComponent } from './silo-monitor/silo-monitor.component';
import { WorkOrderWorkOrderCompleteByProductComponent } from './work-order-complete-by-product/work-order-complete-by-product.component';
import { WorkOrderWorkOrderCompleteConfirmComponent } from './work-order-complete-confirm/work-order-complete-confirm.component';
import { WorkOrderWorkOrderCompleteKpiComponent } from './work-order-complete-kpi/work-order-complete-kpi.component';
import { WorkOrderWorkOrderCompleteComponent } from './work-order-complete/work-order-complete.component';
import { WorkOrderWorkOrderConfigurationComponent } from './work-order-configuration/work-order-configuration.component';
import { WorkOrderWorkOrderLineCompleteConfirmComponent } from './work-order-line-complete-confirm/work-order-line-complete-confirm.component';
import { WorkOrderWorkOrderLineCompleteComponent } from './work-order-line-complete/work-order-line-complete.component';
import { WorkOrderWorkOrderLineMaintenanceComponent } from './work-order-line-maintenance/work-order-line-maintenance.component';
import { WorkOrderWorkOrderLineSparePartMaintenanceComponent } from './work-order-line-spare-part-maintenance/work-order-line-spare-part-maintenance.component';
import { WorkOrderWorkOrderMaintenanceComponent } from './work-order-maintenance/work-order-maintenance.component';
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
  { path: 'work-order', component: WorkOrderWorkOrderComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/work-order', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'production-line', component: WorkOrderProductionLineComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/production-line', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'bill-of-material', component: WorkOrderBillOfMaterialComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/bill-of-material', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'work-order/produce', component: WorkOrderWorkOrderProduceComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/work-order', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'work-order/produce/by-product', component: WorkOrderWorkOrderProduceByProductComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/work-order', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'work-order/produce/kpi', component: WorkOrderWorkOrderProduceKpiComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/work-order', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'work-order/produce/confirm', component: WorkOrderWorkOrderProduceConfirmComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/work-order', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'work-order/line/complete', component: WorkOrderWorkOrderLineCompleteComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/work-order', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'work-order/line/complete/confirm', component: WorkOrderWorkOrderLineCompleteConfirmComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/work-order', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'work-order/complete', component: WorkOrderWorkOrderCompleteComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/work-order', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'work-order/complete/by-product', component: WorkOrderWorkOrderCompleteByProductComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/work-order', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'work-order/complete/kpi', component: WorkOrderWorkOrderCompleteKpiComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/work-order', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'work-order/complete/confirm', component: WorkOrderWorkOrderCompleteConfirmComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/work-order', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'production-plan', component: WorkOrderProductionPlanComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/production-plan', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'production-plan/maintenance', component: WorkOrderProductionPlanMaintenanceComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/production-plan', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'work-order/line/maintenance', component: WorkOrderWorkOrderLineMaintenanceComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/work-order', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'bill-of-material/maintenance', component: WorkOrderBillOfMaterialMaintenanceComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/bill-of-material', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'work-order/assign-production-line', component: WorkOrderAssignProductionLineComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/work-order', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'production-line-maintenance', component: WorkOrderProductionLineMaintenanceComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/production-line', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'mould', component: WorkOrderMouldComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/mould', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'mould/maintenance', component: WorkOrderMouldMaintenanceComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/mould', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'production-kanban', component: WorkOrderProductionKanbanComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/production-kanban', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'work-order/deassign-production-line', component: WorkOrderDeassignProductionLineComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/work-order', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'work-order-configuration', component: WorkOrderWorkOrderConfigurationComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/work-order-configuration', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'produce-transaction', component: WorkOrderProduceTransactionComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/produce-transaction', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'pre-print-lpn-label', component: WorkOrderPrePrintLpnLabelComponent ,  
  }, 
  { path: 'qc-sample-maintenance', component: WorkOrderWorkOrderQcSampleMaintenanceComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/qc-sample-maintenance', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'work-order-qc-inspection', component: WorkOrderWorkOrderQcInspectionComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/work-order-qc-inspection', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'work-order-qc-inspection-operation', component: WorkOrderWorkOrderQcInspectionOperationComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/work-order-qc-inspection', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'qc-inspection-result', component: WorkOrderWorkOrderQcInspectionResultComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/qc-inspection-result', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'qc-rule-configuration', component: WorkOrderQcRuleConfigurationComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/qc-rule-configuration', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'qc-rule-configuration/maintenance', component: WorkOrderQcRuleConfigurationMaintenanceComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/qc-rule-configuration', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'labor', component: WorkOrderLaborComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/labor', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'labor-activity', component: WorkOrderLaborActivityComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/labor-activity', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'mps', component: WorkOrderMpsComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/mps', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'mrp', component: WorkOrderMrpComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/mrp', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'mps-maintenance', component: WorkOrderMpsMaintenanceComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/mps', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'mps-view', component: WorkOrderMpsViewComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/mps-view', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'mps-export', component: WorkOrderMpsExportComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/mps-export', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'mrp-maintenance', component: WorkOrderMrpMaintenanceComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/mrp', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'line/spare-part-maintenance', component: WorkOrderWorkOrderLineSparePartMaintenanceComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/work-order', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'work-order/maintenance', component: WorkOrderWorkOrderMaintenanceComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/work-order', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'production-line-monitor', component: WorkOrderProductionLineMonitorComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/production-line-monitor', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'production-line-monitor/maintenance', component: WorkOrderProductionLineMonitorMaintenanceComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/production-line-monitor', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'production-line-monitor/transaction', component: WorkOrderProductionLineMonitorTransactionComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/production-line-monitor/transaction', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'production-line-status', component: WorkOrderProductionLineStatusComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/production-line-status', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'production-line-dashboard', component: WorkOrderProductionLineDashboardComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/production-line-dashboard', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'production-line-status/display', component: WorkOrderProductionLineStatusDisplayComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/production-line-status/display', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'silo', component: WorkOrderSiloMonitorComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/silo', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },  
  { path: 'silo-configuration', component: WorkOrderSiloConfigurationComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-order/silo-configuration', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkOrderRoutingModule { }
