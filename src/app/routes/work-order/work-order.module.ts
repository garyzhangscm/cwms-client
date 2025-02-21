import { ScrollingModule } from '@angular/cdk/scrolling'; 
import { NgModule, Type  } from '@angular/core';
import { EllipsisModule } from '@delon/abc/ellipsis';
import { STModule } from '@delon/abc/st';
import { GoogleChartsModule } from 'angular-google-charts';
import { XlsxModule } from '@delon/abc/xlsx'; 
import { SharedModule } from '@shared';  
import { PlotlyModule } from 'angular-plotly.js';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTransferModule } from 'ng-zorro-antd/transfer';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeViewModule } from 'ng-zorro-antd/tree-view'; 
import * as PlotlyJS from 'plotly.js-dist-min';


import { CommonModule } from '../common/common.module';
import { DirectivesModule } from '../directives/directives.module';
import { InventoryModule } from '../inventory/inventory.module';
import { UtilModule } from '../util/util.module';
import { WarehouseLayoutModule } from '../warehouse-layout/warehouse-layout.module';
import { WorkOrderAssignProductionLineComponent } from './assign-production-line/assign-production-line.component';
import { WorkOrderBillOfMaterialMaintenanceComponent } from './bill-of-material-maintenance/bill-of-material-maintenance.component';
import { WorkOrderBillOfMaterialComponent } from './bill-of-material/bill-of-material.component';
import { WorkOrderDeassignProductionLineComponent } from './deassign-production-line/deassign-production-line.component';
import { WorkOrderLaborActivityComponent } from './labor-activity/labor-activity.component';
import { WorkOrderLaborComponent } from './labor/labor.component';
import { WorkOrderLightMesConfigurationComponent } from './light-mes-configuration/light-mes-configuration.component';
import { WorkOrderLightMesStatusDashboardComponent } from './light-mes-status-dashboard/light-mes-status-dashboard.component';
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
import { WorkOrderRoutingModule } from './work-order-routing.module';
import { WorkOrderWorkOrderComponent } from './work-order/work-order.component';
import { WorkOrderProductionLineTypeComponent } from './production-line-type/production-line-type.component';
import { WorkOrderProductionLineTypeMaintenanceComponent } from './production-line-type-maintenance/production-line-type-maintenance.component';
import { WorkOrderFinishGoodProductivityReportComponent } from './finish-good-productivity-report/finish-good-productivity-report.component';
import { WorkOrderProductionMoldCountHistoryComponent } from './production-mold-count-history/production-mold-count-history.component';
import { WorkOrderWorkOrderFlowComponent } from './work-order-flow/work-order-flow.component';
import { WorkOrderWorkOrderFlowMaintenanceComponent } from './work-order-flow-maintenance/work-order-flow-maintenance.component';


PlotlyModule.plotlyjs = PlotlyJS;


const COMPONENTS: Array<Type<void>> = [
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
  WorkOrderAssignProductionLineComponent,
  WorkOrderProductionLineMaintenanceComponent,
  WorkOrderMouldComponent,
  WorkOrderMouldMaintenanceComponent,
  WorkOrderProductionKanbanComponent,
  WorkOrderDeassignProductionLineComponent,
  WorkOrderWorkOrderConfigurationComponent,
  WorkOrderProduceTransactionComponent,
  WorkOrderPrePrintLpnLabelComponent,
  WorkOrderWorkOrderQcSampleMaintenanceComponent,
  WorkOrderWorkOrderQcInspectionComponent,
  WorkOrderWorkOrderQcInspectionOperationComponent,
  WorkOrderWorkOrderQcInspectionResultComponent ,
  WorkOrderQcRuleConfigurationComponent,
  WorkOrderQcRuleConfigurationMaintenanceComponent,
  WorkOrderLaborComponent,
  WorkOrderLaborActivityComponent,
  WorkOrderMpsComponent,
  WorkOrderMrpComponent,
  WorkOrderMpsMaintenanceComponent,
  WorkOrderMpsViewComponent,
  WorkOrderMpsExportComponent,
  WorkOrderMrpMaintenanceComponent,
  WorkOrderWorkOrderLineSparePartMaintenanceComponent,
  WorkOrderWorkOrderMaintenanceComponent,
  WorkOrderProductionLineMonitorComponent,
  WorkOrderProductionLineMonitorMaintenanceComponent,
  WorkOrderProductionLineMonitorTransactionComponent,
  WorkOrderProductionLineStatusComponent,
  WorkOrderProductionLineDashboardComponent,
  WorkOrderProductionLineStatusDisplayComponent,
  WorkOrderSiloMonitorComponent,
  WorkOrderSiloConfigurationComponent,
  WorkOrderLightMesConfigurationComponent,
  WorkOrderLightMesStatusDashboardComponent,
  WorkOrderProductionLineTypeComponent,
  WorkOrderProductionLineTypeMaintenanceComponent,
  WorkOrderFinishGoodProductivityReportComponent,
  WorkOrderProductionMoldCountHistoryComponent,
  WorkOrderWorkOrderFlowComponent,
  WorkOrderWorkOrderFlowMaintenanceComponent];
  
const COMPONENTS_NOROUNT: Array<Type<void>> = [];

@NgModule({
  imports: [
    SharedModule,
    WorkOrderRoutingModule, DirectivesModule,
    NzLayoutModule,
    NzDescriptionsModule,
    NzTransferModule,
    CommonModule,
    WarehouseLayoutModule, 
    ScrollingModule, STModule, NzStepsModule,
    NzAutocompleteModule,
    UtilModule, 
    NzSkeletonModule ,
    NzStatisticModule ,
    InventoryModule,
    NzResultModule,
    NzCalendarModule, 
    NzEmptyModule , 
    NzTreeViewModule ,
    NzTreeModule,
    EllipsisModule,
    XlsxModule ,
    GoogleChartsModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  providers: [NzModalService]
})
export class WorkOrderModule { }
