import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WarehouseLayoutLocationGroupMaintenanceConfirmComponent } from './location-group-maintenance-confirm/location-group-maintenance-confirm.component';
import { WarehouseLayoutLocationGroupMaintenanceComponent } from './location-group-maintenance/location-group-maintenance.component';
import { WarehouseLayoutLocationGroupComponent } from './location-group/location-group.component';
import { WarehouseLayoutLocationQueryPopupComponent } from './location-query-popup/location-query-popup.component';
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
  { path: 'location-query-popup', component: WarehouseLayoutLocationQueryPopupComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WarehouseLayoutRoutingModule { }
