import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { UtilRoutingModule } from './util-routing.module';
import { UtilFileUploadComponent } from './file-upload/file-upload.component';
import { UtilStackedBarChartComponent } from './stacked-bar-chart/stacked-bar-chart.component';
import { UtilTestDataInitComponent } from './test-data-init/test-data-init.component';

const COMPONENTS = [UtilFileUploadComponent, UtilStackedBarChartComponent,
  UtilTestDataInitComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [SharedModule, UtilRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  exports: [UtilStackedBarChartComponent],
  entryComponents: COMPONENTS_NOROUNT,
})
export class UtilModule {}
