import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgModule, Type } from '@angular/core';
import { EllipsisModule } from '@delon/abc/ellipsis';
import { STModule } from '@delon/abc/st';
import { SharedModule } from '@shared'; 
import { GoogleChartsModule } from 'angular-google-charts';
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
import { CountdownModule } from 'ngx-countdown';

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
  WorkOrderWorkOrderMaintenanceComponent];
const COMPONENTS_NOROUNT: Array<Type<void>> = [];

@NgModule({
  imports: [
    SharedModule,
    WorkOrderRoutingModule, DirectivesModule,
    NzLayoutModule,
    NzDescriptionsModule,
    NzTransferModule,
    CommonModule,
    WarehouseLayoutModule, CountdownModule,
    ScrollingModule, STModule, NzStepsModule,
    NzAutocompleteModule,
    UtilModule, 
    NzSkeletonModule ,
    NzStatisticModule ,
    InventoryModule,
    NzResultModule,
    NzCalendarModule,
    GoogleChartsModule,
    NzEmptyModule , 
    NzTreeViewModule ,
    NzTreeModule,
    EllipsisModule

  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  providers: [NzModalService]
})
export class WorkOrderModule { }
