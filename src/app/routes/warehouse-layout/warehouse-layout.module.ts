import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared'; 
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzStepsModule } from 'ng-zorro-antd/steps'; 
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { DirectivesModule } from '../directives/directives.module'; 
import { WarehouseLayoutLocationDashboardComponent } from './location-dashboard/location-dashboard.component';
import { WarehouseLayoutLocationGroupMaintenanceConfirmComponent } from './location-group-maintenance-confirm/location-group-maintenance-confirm.component';
import { WarehouseLayoutLocationGroupMaintenanceComponent } from './location-group-maintenance/location-group-maintenance.component';
import { WarehouseLayoutLocationGroupComponent } from './location-group/location-group.component';
import { WarehouseLayoutLocationMaintenanceComponent } from './location-maintenance/location-maintenance.component';
import { WarehouseLayoutLocationQueryPopupComponent } from './location-query-popup/location-query-popup.component';
import { WarehouseLayoutWarehouseConfigurationComponent } from './warehouse-configuration/warehouse-configuration.component';
import { WarehouseLayoutWarehouseLayoutMaintenanceComponent } from './warehouse-layout-maintenance/warehouse-layout-maintenance.component';
import { WarehouseLayoutRoutingModule } from './warehouse-layout-routing.module';
import { WarehouseLayoutWarehouseLocationComponent } from './warehouse-location/warehouse-location.component';
import { WarehouseLayoutWarehouseMaintenanceConfirmComponent } from './warehouse-maintenance-confirm/warehouse-maintenance-confirm.component';
import { WarehouseLayoutWarehouseMaintenanceComponent } from './warehouse-maintenance/warehouse-maintenance.component';
import { WarehouseLayoutWarehouseComponent } from './warehouse/warehouse.component';
import { WarehouseLayoutPickZoneComponent } from './pick-zone/pick-zone.component';
import { WarehouseLayoutPickZoneMaintenanceComponent } from './pick-zone-maintenance/pick-zone-maintenance.component';

const COMPONENTS: Array<Type<void>> = [
  WarehouseLayoutWarehouseComponent,
  WarehouseLayoutLocationGroupComponent,
  WarehouseLayoutWarehouseMaintenanceComponent,
  WarehouseLayoutWarehouseMaintenanceConfirmComponent,
  WarehouseLayoutLocationGroupMaintenanceComponent,
  WarehouseLayoutLocationGroupMaintenanceConfirmComponent,
  WarehouseLayoutWarehouseLocationComponent,
  WarehouseLayoutLocationQueryPopupComponent,
  WarehouseLayoutWarehouseLayoutMaintenanceComponent,
  WarehouseLayoutWarehouseConfigurationComponent,
  WarehouseLayoutLocationMaintenanceComponent,
  WarehouseLayoutLocationDashboardComponent,
  WarehouseLayoutPickZoneComponent,
  WarehouseLayoutPickZoneMaintenanceComponent];

const COMPONENTS_NOROUNT: Array<Type<void>> = [];


@NgModule({
  imports: [
    SharedModule,
    WarehouseLayoutRoutingModule,
    DirectivesModule,
    NzDescriptionsModule,
    NzStepsModule,  
    NzResultModule 
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  exports: [WarehouseLayoutLocationQueryPopupComponent]
})
export class WarehouseLayoutModule { }
