import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { WarehouseLayoutRoutingModule } from './warehouse-layout-routing.module';
import { WarehouseLayoutWarehouseComponent } from './warehouse/warehouse.component';
import { WarehouseLayoutLocationGroupComponent } from './location-group/location-group.component';
import { WarehouseLayoutWarehouseMaintenanceComponent } from './warehouse-maintenance/warehouse-maintenance.component';
import { WarehouseLayoutWarehouseMaintenanceConfirmComponent } from './warehouse-maintenance-confirm/warehouse-maintenance-confirm.component';
import { WarehouseLayoutLocationGroupMaintenanceComponent } from './location-group-maintenance/location-group-maintenance.component';
import { WarehouseLayoutLocationGroupMaintenanceConfirmComponent } from './location-group-maintenance-confirm/location-group-maintenance-confirm.component';
import { WarehouseLayoutWarehouseLocationComponent } from './warehouse-location/warehouse-location.component';

const COMPONENTS = [
  WarehouseLayoutWarehouseComponent,
  WarehouseLayoutLocationGroupComponent,
  WarehouseLayoutWarehouseMaintenanceComponent,
  WarehouseLayoutWarehouseMaintenanceConfirmComponent,
  WarehouseLayoutLocationGroupMaintenanceComponent,
  WarehouseLayoutLocationGroupMaintenanceConfirmComponent,
  WarehouseLayoutWarehouseLocationComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    WarehouseLayoutRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class WarehouseLayoutModule { }
