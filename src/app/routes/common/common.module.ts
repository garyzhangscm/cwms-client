import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { CommonRoutingModule } from './common-routing.module';
import { CommonClientComponent } from './client/client.component';
import { CommonClientMaintenanceComponent } from './client-maintenance/client-maintenance.component';
import { CommonClientAddressMaintenanceComponent } from './client-address-maintenance/client-address-maintenance.component';
import { CommonClientMaintenanceConfimComponent } from './client-maintenance-confim/client-maintenance-confim.component';

const COMPONENTS = [
  CommonClientComponent,
  CommonClientMaintenanceComponent,
  CommonClientAddressMaintenanceComponent,
  CommonClientMaintenanceConfimComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    CommonRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class CommonModule { }
