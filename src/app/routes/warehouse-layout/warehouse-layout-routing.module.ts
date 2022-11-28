import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WarehouseLayoutLocationDashboardComponent } from './location-dashboard/location-dashboard.component';
import { WarehouseLayoutLocationGroupMaintenanceConfirmComponent } from './location-group-maintenance-confirm/location-group-maintenance-confirm.component';
import { WarehouseLayoutLocationGroupMaintenanceComponent } from './location-group-maintenance/location-group-maintenance.component';
import { WarehouseLayoutLocationGroupComponent } from './location-group/location-group.component';
import { WarehouseLayoutLocationMaintenanceComponent } from './location-maintenance/location-maintenance.component';
import { WarehouseLayoutLocationQueryPopupComponent } from './location-query-popup/location-query-popup.component';
import { WarehouseLayoutWarehouseConfigurationComponent } from './warehouse-configuration/warehouse-configuration.component';
import { WarehouseLayoutWarehouseLayoutMaintenanceComponent } from './warehouse-layout-maintenance/warehouse-layout-maintenance.component';
import { WarehouseLayoutWarehouseLocationComponent } from './warehouse-location/warehouse-location.component';
import { WarehouseLayoutWarehouseMaintenanceConfirmComponent } from './warehouse-maintenance-confirm/warehouse-maintenance-confirm.component';
import { WarehouseLayoutWarehouseMaintenanceComponent } from './warehouse-maintenance/warehouse-maintenance.component';
import { WarehouseLayoutWarehouseComponent } from './warehouse/warehouse.component';

const routes: Routes = [
  { path: 'warehouse', component: WarehouseLayoutWarehouseComponent },
  { path: 'location-group', component: WarehouseLayoutLocationGroupComponent },
  { path: 'warehouse-maintenance', component: WarehouseLayoutWarehouseMaintenanceComponent },
  { path: 'warehouse-maintenance/confirm', component: WarehouseLayoutWarehouseMaintenanceConfirmComponent },
  { path: 'warehouse-maintenance/:id', component: WarehouseLayoutWarehouseMaintenanceComponent },
  { path: 'warehouse-maintenance/:id/confirm', component: WarehouseLayoutWarehouseMaintenanceConfirmComponent },
  { path: 'location-group-maintenance', component: WarehouseLayoutLocationGroupMaintenanceComponent },
  {
    path: 'location-group-maintenance/confirm',
    component: WarehouseLayoutLocationGroupMaintenanceConfirmComponent,
  },
  {
    path: 'location-group-maintenance/:id/confirm',
    component: WarehouseLayoutLocationGroupMaintenanceConfirmComponent,
  },
  { path: 'warehouse-location', component: WarehouseLayoutWarehouseLocationComponent },
  { path: 'location-query-popup', component: WarehouseLayoutLocationQueryPopupComponent },
  { path: 'warehouse-layout-maintenance', component: WarehouseLayoutWarehouseLayoutMaintenanceComponent },
  { path: 'warehouse-configuration', component: WarehouseLayoutWarehouseConfigurationComponent },
  { path: 'location/maintenance', component: WarehouseLayoutLocationMaintenanceComponent },
  { path: 'location-dashboard', component: WarehouseLayoutLocationDashboardComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WarehouseLayoutRoutingModule { }
