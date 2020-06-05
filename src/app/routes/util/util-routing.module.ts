import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UtilFileUploadComponent } from './file-upload/file-upload.component';
import { UtilStackedBarChartComponent } from './stacked-bar-chart/stacked-bar-chart.component';
import { UtilTestDataInitComponent } from './test-data-init/test-data-init.component';
import { UtilIconListComponent } from './icon-list/icon-list.component';
import { UtilTesterComponent } from './tester/tester.component';

const routes: Routes = [
  { path: 'file-upload', component: UtilFileUploadComponent },
  { path: 'file-upload/:filetype', component: UtilFileUploadComponent },
  { path: 'stacked-bar-chart', component: UtilStackedBarChartComponent },
  { path: 'test-data-init', component: UtilTestDataInitComponent },
  { path: 'icon-list', component: UtilIconListComponent },
  { path: 'tester', component: UtilTesterComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UtilRoutingModule {}
