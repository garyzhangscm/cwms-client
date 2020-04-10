import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WarehouseLayoutWarehouseComponent } from './warehouse/warehouse.component';
import { WarehouseLayoutLocationGroupComponent } from './location-group/location-group.component';
import { WarehouseLayoutWarehouseMaintenanceComponent } from './warehouse-maintenance/warehouse-maintenance.component';
import { WarehouseLayoutWarehouseMaintenanceConfirmComponent } from './warehouse-maintenance-confirm/warehouse-maintenance-confirm.component';
import { WarehouseLayoutLocationGroupMaintenanceComponent } from './location-group-maintenance/location-group-maintenance.component';
import { WarehouseLayoutLocationGroupMaintenanceConfirmComponent } from './location-group-maintenance-confirm/location-group-maintenance-confirm.component';
import { WarehouseLayoutWarehouseLocationComponent } from './warehouse-location/warehouse-location.component';

const routes: Routes = [
  { path: 'warehouse', component: WarehouseLayoutWarehouseComponent },
  { path: 'location-group', component: WarehouseLayoutLocationGroupComponent },
  { path: 'warehouse-maintenance', component: WarehouseLayoutWarehouseMaintenanceComponent },
  { path: 'warehouse-maintenance/confirm', component: WarehouseLayoutWarehouseMaintenanceConfirmComponent },
  { path: 'warehouse-maintenance/:id', component: WarehouseLayoutWarehouseMaintenanceComponent },
  { path: 'warehouse-maintenance/:id/confirm', component: WarehouseLayoutWarehouseMaintenanceConfirmComponent },
  { path: 'location-group-maintenance', component: WarehouseLayoutLocationGroupMaintenanceComponent },
  {
    path: 'location-group-maintenance/:id/confirm',
    component: WarehouseLayoutLocationGroupMaintenanceConfirmComponent,
  },
  { path: 'warehouse-location', component: WarehouseLayoutWarehouseLocationComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WarehouseLayoutRoutingModule {}
