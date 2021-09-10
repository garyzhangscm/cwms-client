import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/guard/auth.guard';
import { UtilDataInitComponent } from './data-init/data-init.component';
import { UtilFileUploadComponent } from './file-upload/file-upload.component';
import { UtilIconListComponent } from './icon-list/icon-list.component';
import { UtilRfMaintenanceComponent } from './rf-maintenance/rf-maintenance.component';
import { UtilRfComponent } from './rf/rf.component';
import { UtilSystemConfigurationComponent } from './system-configuration/system-configuration.component';  
import { UtilSystemControlledNumberMaintenanceComponent } from './system-controlled-number-maintenance/system-controlled-number-maintenance.component';
import { UtilSystemControlledNumberComponent } from './system-controlled-number/system-controlled-number.component';
import { UtilTableColumnSelectionComponent } from './table-column-selection/table-column-selection.component';
import { UtilTestDataInitComponent } from './test-data-init/test-data-init.component';
import { UtilTesterComponent } from './tester/tester.component';

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
  { path: 'data-init', component: UtilDataInitComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UtilRoutingModule { }
