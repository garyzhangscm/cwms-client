import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UtilFileUploadComponent } from './file-upload/file-upload.component';
import { UtilStackedBarChartComponent } from './stacked-bar-chart/stacked-bar-chart.component';

const routes: Routes = [
  { path: 'file-upload', component: UtilFileUploadComponent },
  { path: 'file-upload/:filetype', component: UtilFileUploadComponent },
  { path: 'stacked-bar-chart', component: UtilStackedBarChartComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UtilRoutingModule {}
