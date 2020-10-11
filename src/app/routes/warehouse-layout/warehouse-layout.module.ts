import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { DirectivesModule } from '../directives/directives.module';
import { WarehouseLayoutLocationGroupMaintenanceConfirmComponent } from './location-group-maintenance-confirm/location-group-maintenance-confirm.component';
import { WarehouseLayoutLocationGroupMaintenanceComponent } from './location-group-maintenance/location-group-maintenance.component';
import { WarehouseLayoutLocationGroupComponent } from './location-group/location-group.component';
import { WarehouseLayoutLocationQueryPopupComponent } from './location-query-popup/location-query-popup.component';
import { WarehouseLayoutRoutingModule } from './warehouse-layout-routing.module';
import { WarehouseLayoutWarehouseLocationComponent } from './warehouse-location/warehouse-location.component';
import { WarehouseLayoutWarehouseMaintenanceConfirmComponent } from './warehouse-maintenance-confirm/warehouse-maintenance-confirm.component';
import { WarehouseLayoutWarehouseMaintenanceComponent } from './warehouse-maintenance/warehouse-maintenance.component';
import { WarehouseLayoutWarehouseComponent } from './warehouse/warehouse.component';

const COMPONENTS: Type<void>[] = [
  WarehouseLayoutWarehouseComponent,
  WarehouseLayoutLocationGroupComponent,
  WarehouseLayoutWarehouseMaintenanceComponent,
  WarehouseLayoutWarehouseMaintenanceConfirmComponent,
  WarehouseLayoutLocationGroupMaintenanceComponent,
  WarehouseLayoutLocationGroupMaintenanceConfirmComponent,
  WarehouseLayoutWarehouseLocationComponent,
  WarehouseLayoutLocationQueryPopupComponent];

const COMPONENTS_NOROUNT: Type<void>[] = [];

@NgModule({
  imports: [
    SharedModule,
    WarehouseLayoutRoutingModule, 
    DirectivesModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
})
export class WarehouseLayoutModule { }
