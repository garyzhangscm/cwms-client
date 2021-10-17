import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTransferModule } from 'ng-zorro-antd/transfer';

import { InventoryModule } from '../inventory/inventory.module';
import { UtilModule } from '../util/util.module';
import { WarehouseLayoutModule } from '../warehouse-layout/warehouse-layout.module';
import { QcInspectInventoryComponent } from './inspect-inventory/inspect-inventory.component';
import { QcQcConfigurationComponent } from './qc-configuration/qc-configuration.component';
import { QcQcInspectionComponent } from './qc-inspection/qc-inspection.component';
import { QcQcResultComponent } from './qc-result/qc-result.component';
import { QcRoutingModule } from './qc-routing.module';
import { QcQcRuleConfigurationMaintenanceComponent } from './qc-rule-configuration-maintenance/qc-rule-configuration-maintenance.component';
import { QcQcRuleConfigurationComponent } from './qc-rule-configuration/qc-rule-configuration.component';
import { QcQcRuleMaintenanceComponent } from './qc-rule-maintenance/qc-rule-maintenance.component';
import { QcQcRuleComponent } from './qc-rule/qc-rule.component';

const COMPONENTS: Array<Type<void>> = [
  QcQcRuleComponent,
  QcQcConfigurationComponent,
  QcQcInspectionComponent,
  QcQcRuleConfigurationComponent,
  QcQcRuleMaintenanceComponent,
  QcQcRuleConfigurationMaintenanceComponent,
  QcInspectInventoryComponent,
  QcQcResultComponent];

@NgModule({
  imports: [
    SharedModule,
    QcRoutingModule,
    NzDescriptionsModule,
    UtilModule, 
    NzStepsModule,
    InventoryModule, 
    NzTransferModule,
    WarehouseLayoutModule,NzIconModule ,
    NzSkeletonModule 
  ],
  declarations: COMPONENTS,
})
export class QcModule { }
