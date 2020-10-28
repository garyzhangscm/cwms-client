import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/guard/auth.guard';
import { UtilFileUploadComponent } from './file-upload/file-upload.component';
import { UtilIconListComponent } from './icon-list/icon-list.component';
import { UtilTestDataInitComponent } from './test-data-init/test-data-init.component';
import { UtilTesterComponent } from './tester/tester.component';

const routes: Routes = [
  { path: 'file-upload', component: UtilFileUploadComponent, canActivate: [AuthGuard] },
  { path: 'file-upload/:filetype', component: UtilFileUploadComponent },
  { path: 'test-data-init', component: UtilTestDataInitComponent, canActivate: [AuthGuard] },
  { path: 'icon-list', component: UtilIconListComponent, canActivate: [AuthGuard] },
  { path: 'tester', component: UtilTesterComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UtilRoutingModule { }
