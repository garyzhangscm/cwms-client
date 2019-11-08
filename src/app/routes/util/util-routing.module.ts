import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UtilFileUploadComponent } from './file-upload/file-upload.component';

const routes: Routes = [
  { path: 'file-upload', component: UtilFileUploadComponent },
  { path: 'file-upload/:filetype', component: UtilFileUploadComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UtilRoutingModule {}
