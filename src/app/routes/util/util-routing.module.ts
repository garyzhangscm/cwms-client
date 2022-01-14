import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/guard/auth.guard';
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
import { UtilWorkOrderQueryPopupComponent } from './work-order-query-popup/work-order-query-popup.component';
import { UtilOrderQueryPopupComponent } from './order-query-popup/order-query-popup.component';
import { UtilGanttComponent } from './gantt/gantt.component';

const routes: Routes = [
  { path: 'file-upload', component: UtilFileUploadComponent, canActivate: [AuthGuard] },
  { path: 'file-upload/:filetype', component: UtilFileUploadComponent },
  { path: 'test-data-init', component: UtilTestDataInitComponent, canActivate: [AuthGuard] },
  { path: 'icon-list', component: UtilIconListComponent, canActivate: [AuthGuard] },
  { path: 'tester', component: UtilTesterComponent, canActivate: [AuthGuard] },
  { path: 'system-configuration', component: UtilSystemConfigurationComponent }, 
  { path: 'table-column-selection', component: UtilTableColumnSelectionComponent },
  { path: 'rf', component: UtilRfComponent },
  { path: 'rf/maintenance', component: UtilRfMaintenanceComponent },
  { path: 'system-controlled-number', component: UtilSystemControlledNumberComponent },
  { path: 'system-controlled-number/maintenance', component: UtilSystemControlledNumberMaintenanceComponent },
  { path: 'data-init', component: UtilDataInitComponent },
  { path: 'billable-request', component: UtilBillableRequestComponent },
  { path: 'rf-app-version', component: UtilRfAppVersionComponent },
  { path: 'rf-app-version/maintenance', component: UtilRfAppVersionMaintenanceComponent },
  { path: 'company', component: UtilCompanyComponent },
  { path: 'company-maintenance', component: UtilCompanyMaintenanceComponent },
  { path: 'menu', component: UtilMenuComponent },
  { path: 'company-menu', component: UtilCompanyMenuComponent },
  { path: 'data-transfer', component: UtilDataTransferComponent },
  { path: 'work-order-query-popup', component: UtilWorkOrderQueryPopupComponent },
  { path: 'order-query-popup', component: UtilOrderQueryPopupComponent },
  { path: 'gantt', component: UtilGanttComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UtilRoutingModule { }
