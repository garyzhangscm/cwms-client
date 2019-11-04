import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WarehouseLayoutWarehouseComponent } from './warehouse/warehouse.component';
import { WarehouseLayoutLocationGroupComponent } from './location-group/location-group.component';
import { WarehouseLayoutWarehouseMaintenanceComponent } from './warehouse-maintenance/warehouse-maintenance.component';

const routes: Routes = [
  { path: 'warehouse', component: WarehouseLayoutWarehouseComponent },
  { path: 'location-group', component: WarehouseLayoutLocationGroupComponent },
  { path: 'warehouse-maintenance', component: WarehouseLayoutWarehouseMaintenanceComponent },
  { path: 'warehouse-maintenance/:id', component: WarehouseLayoutWarehouseMaintenanceComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WarehouseLayoutRoutingModule {}
