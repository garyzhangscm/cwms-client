import { NgModule, Type } from '@angular/core'; 
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTransferModule } from 'ng-zorro-antd/transfer';
 
import { DirectivesModule } from '../directives/directives.module';
import { InventoryModule } from '../inventory/inventory.module';
import { UtilModule } from '../util/util.module';
import { WarehouseLayoutModule } from '../warehouse-layout/warehouse-layout.module';
import { QcInspectByRequestComponent } from './inspect-by-request/inspect-by-request.component';
import { QcInspectInventoryComponent } from './inspect-inventory/inspect-inventory.component';
import { QcQcConfigurationComponent } from './qc-configuration/qc-configuration.component';
import { QcQcInspectionRequestMaintenanceComponent } from './qc-inspection-request-maintenance/qc-inspection-request-maintenance.component';
import { QcQcInspectionComponent } from './qc-inspection/qc-inspection.component';
import { QcQcResultComponent } from './qc-result/qc-result.component';
import { QcRoutingModule } from './qc-routing.module';
import { QcQcRuleConfigurationMaintenanceComponent } from './qc-rule-configuration-maintenance/qc-rule-configuration-maintenance.component';
import { QcQcRuleConfigurationComponent } from './qc-rule-configuration/qc-rule-configuration.component';
import { QcQcRuleMaintenanceComponent } from './qc-rule-maintenance/qc-rule-maintenance.component';
import { QcQcRuleComponent } from './qc-rule/qc-rule.component';
import { QcQcInspectionDocumentMaintenanceComponent } from './qc-inspection-document-maintenance/qc-inspection-document-maintenance.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@delon/abc/page-header';
import { I18nPipe } from '@delon/theme';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzCardModule } from 'ng-zorro-antd/card';
import { STModule } from '@delon/abc/st';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { CWMSCommonModule } from '../common/common.module';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { CommonModule } from '@angular/common';

const COMPONENTS: Array<Type<void>> = [
  QcQcRuleComponent,
  QcQcConfigurationComponent,
  QcQcInspectionComponent,
  QcQcRuleConfigurationComponent,
  QcQcRuleMaintenanceComponent,
  QcQcRuleConfigurationMaintenanceComponent,
  QcInspectInventoryComponent,
  QcQcResultComponent,
  QcQcInspectionRequestMaintenanceComponent,
  QcInspectByRequestComponent,
  QcQcInspectionDocumentMaintenanceComponent];

@NgModule({
  imports: [ 
    QcRoutingModule,
    NzDescriptionsModule,
    UtilModule, 
    NzStepsModule,
    InventoryModule, 
    NzTransferModule,
    WarehouseLayoutModule,NzIconModule ,
    NzSkeletonModule , 
    NzCarouselModule,
    NzImageModule , 
    DirectivesModule, 
    NzFormModule,
    FormsModule, 
    ReactiveFormsModule,
    PageHeaderComponent ,
    I18nPipe,
    NzSpinModule ,
    NzBreadCrumbModule ,
    NzCardModule ,
    STModule,
    NzBadgeModule ,
    NzListModule ,
    NzInputNumberModule ,
    NzDividerModule,
    NzSelectModule,
    NzInputModule ,
    NzButtonModule,
    NzDropDownModule ,
    CWMSCommonModule,
    NzTableModule ,
    NzUploadModule ,
    NzModalModule,        
    NzTabsModule ,
    CommonModule,
  ],
  declarations: COMPONENTS,
})
export class QcModule { }
