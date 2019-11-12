import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardLocationsComponent } from './locations/locations.component';
import { DashboardDefaultComponent } from './default/default.component';
import { UtilModule } from '../util/util.module';

const COMPONENTS = [DashboardLocationsComponent, DashboardDefaultComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [SharedModule, DashboardRoutingModule, UtilModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT,
})
export class DashboardModule {}
