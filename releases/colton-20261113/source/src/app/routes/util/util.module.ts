import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgModule, Type } from '@angular/core';
import { DownFileModule } from '@delon/abc/down-file';
import { EllipsisModule } from '@delon/abc/ellipsis'; 
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTransferModule } from 'ng-zorro-antd/transfer';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { UtilBillableRequestComponent } from './billable-request/billable-request.component';
import { UtilCompanyMaintenanceComponent } from './company-maintenance/company-maintenance.component';
import { UtilCompanyMenuComponent } from './company-menu/company-menu.component';
import { UtilCompanyComponent } from './company/company.component';
import { UtilDataInitComponent } from './data-init/data-init.component';
import { UtilDataTransferComponent } from './data-transfer/data-transfer.component';
import { UtilFileUploadComponent } from './file-upload/file-upload.component'; 
import { UtilIconListComponent } from './icon-list/icon-list.component'; 
import { UtilMenuComponent } from './menu/menu.component';
import { UtilOrderQueryPopupComponent } from './order-query-popup/order-query-popup.component';
import { UtilQuickbookAuthComponent } from './quickbook-auth/quickbook-auth.component';
import { UtilQuickbookOnlineConfigurationComponent } from './quickbook-online-configuration/quickbook-online-configuration.component';
import { UtilQuickbookPermissionComponent } from './quickbook-permission/quickbook-permission.component';
import { UtilRfAppVersionMaintenanceComponent } from './rf-app-version-maintenance/rf-app-version-maintenance.component';
import { UtilRfAppVersionComponent } from './rf-app-version/rf-app-version.component';
import { UtilRfConfigurationComponent } from './rf-configuration/rf-configuration.component';
import { UtilRfMaintenanceComponent } from './rf-maintenance/rf-maintenance.component';
import { UtilRfComponent } from './rf/rf.component';
import { UtilSystemConfigurationComponent } from './system-configuration/system-configuration.component';
import { UtilSystemControlledNumberMaintenanceComponent } from './system-controlled-number-maintenance/system-controlled-number-maintenance.component';
import { UtilSystemControlledNumberComponent } from './system-controlled-number/system-controlled-number.component';
import { UtilTableColumnSelectionComponent } from './table-column-selection/table-column-selection.component';
import { UtilTestDataInitComponent } from './test-data-init/test-data-init.component';
import { UtilTesterComponent } from './tester/tester.component';
import { UtilRoutingModule } from './util-routing.module';
import { UtilWorkOrderQueryPopupComponent } from './work-order-query-popup/work-order-query-popup.component'; 
import {DragDropModule} from '@angular/cdk/drag-drop'; 
import {CdkDropList} from '@angular/cdk/drag-drop'; 
import {CdkDrag} from '@angular/cdk/drag-drop';
import { UtilCustomReportComponent } from './custom-report/custom-report.component';
import { UtilCustomReportMaintenanceComponent } from './custom-report-maintenance/custom-report-maintenance.component';
import { UtilExecuteCustomReportComponent } from './execute-custom-report/execute-custom-report.component';   
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@delon/abc/page-header';
import { STModule } from '@delon/abc/st';
import { I18nPipe } from '@delon/theme';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { CommonModule } from '@angular/common';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzRadioModule } from 'ng-zorro-antd/radio';

const COMPONENTS: Array<Type<void>> = [
  UtilFileUploadComponent,  
  UtilTestDataInitComponent,
  UtilIconListComponent,
  UtilTesterComponent,
  UtilSystemConfigurationComponent,
  UtilTableColumnSelectionComponent,
  UtilRfComponent,
  UtilRfMaintenanceComponent,
  UtilSystemControlledNumberComponent,
  UtilSystemControlledNumberMaintenanceComponent,
  UtilDataInitComponent,
  UtilBillableRequestComponent,
  UtilRfAppVersionComponent,
  UtilRfAppVersionMaintenanceComponent,
  UtilCompanyComponent,
  UtilCompanyMaintenanceComponent,
  UtilMenuComponent,
  UtilCompanyMenuComponent,
  UtilDataTransferComponent,
  UtilWorkOrderQueryPopupComponent,
  UtilOrderQueryPopupComponent,
  UtilQuickbookAuthComponent,
  UtilQuickbookPermissionComponent,
  UtilQuickbookOnlineConfigurationComponent,
  UtilRfConfigurationComponent, 
  UtilCustomReportComponent,
  UtilCustomReportMaintenanceComponent,
  UtilExecuteCustomReportComponent];
  

const COMPONENTS_NOROUNT: Array<Type<void>> = [];

@NgModule({
  imports: [ 
    UtilRoutingModule,    
    NzDescriptionsModule, 
    NzStepsModule, 
    NzTransferModule,
    NzSkeletonModule ,
    NzEmptyModule,
    ScrollingModule,
    DownFileModule, 
    EllipsisModule, 
    NzTypographyModule, 
    NzResultModule,
    DragDropModule, 
    CdkDropList, 
    CdkDrag,
    STModule,    
    NzFormModule,
    FormsModule, 
    ReactiveFormsModule,
    PageHeaderComponent ,
    I18nPipe,
    NzSpinModule ,
    NzDatePickerModule ,
    NzButtonModule,
    NzBreadCrumbModule ,
    NzCardModule ,
    NzSelectModule,
    NzListModule ,
    NzDropDownModule ,    
    NzDividerModule,
    NzModalModule,
    NzTabsModule ,
    NzTableModule ,
    NzProgressModule,
    CommonModule,
    NzUploadModule ,
    NzIconModule ,
    NzToolTipModule ,
    NzInputNumberModule ,
    NzInputModule,
    NzCheckboxModule ,
    NzRadioModule,
    
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  exports: [UtilTableColumnSelectionComponent, 
    UtilWorkOrderQueryPopupComponent, 
    UtilOrderQueryPopupComponent],

})
export class UtilModule { }

