import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTransferModule } from 'ng-zorro-antd/transfer';

import { UtilBillableRequestComponent } from './billable-request/billable-request.component';
import { UtilCompanyMaintenanceComponent } from './company-maintenance/company-maintenance.component';
import { UtilCompanyMenuComponent } from './company-menu/company-menu.component';
import { UtilCompanyComponent } from './company/company.component';
import { UtilDataInitComponent } from './data-init/data-init.component';
import { UtilDataTransferComponent } from './data-transfer/data-transfer.component';
import { UtilFileUploadComponent } from './file-upload/file-upload.component';
import { UtilIconListComponent } from './icon-list/icon-list.component'; 
import { UtilMenuComponent } from './menu/menu.component';
import { UtilRfAppVersionMaintenanceComponent } from './rf-app-version-maintenance/rf-app-version-maintenance.component';
import { UtilRfAppVersionComponent } from './rf-app-version/rf-app-version.component';
import { UtilRfMaintenanceComponent } from './rf-maintenance/rf-maintenance.component';
import { UtilRfComponent } from './rf/rf.component';
import { UtilSystemConfigurationComponent } from './system-configuration/system-configuration.component';
import { UtilSystemControlledNumberMaintenanceComponent } from './system-controlled-number-maintenance/system-controlled-number-maintenance.component';
import { UtilSystemControlledNumberComponent } from './system-controlled-number/system-controlled-number.component';
import { UtilTableColumnSelectionComponent } from './table-column-selection/table-column-selection.component';
import { UtilTestDataInitComponent } from './test-data-init/test-data-init.component';
import { UtilTesterComponent } from './tester/tester.component';
import { UtilRoutingModule } from './util-routing.module';

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
  UtilDataTransferComponent];
  

const COMPONENTS_NOROUNT: Array<Type<void>> = [];

@NgModule({
  imports: [
    SharedModule,
    UtilRoutingModule,    
    NzDescriptionsModule, 
    NzStepsModule, 
    NzTransferModule,
    NzSkeletonModule 
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  exports: [UtilTableColumnSelectionComponent],

})
export class UtilModule { }

