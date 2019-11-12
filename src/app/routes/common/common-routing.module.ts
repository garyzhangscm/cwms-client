import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonClientComponent } from './client/client.component';
import { CommonClientMaintenanceComponent } from './client-maintenance/client-maintenance.component';
import { CommonClientAddressMaintenanceComponent } from './client-address-maintenance/client-address-maintenance.component';
import { CommonClientMaintenanceConfimComponent } from './client-maintenance-confim/client-maintenance-confim.component';

const routes: Routes = [
  { path: 'client', component: CommonClientComponent },
  { path: 'client-maintenance', component: CommonClientMaintenanceComponent },
  { path: 'client-maintenance/address', component: CommonClientAddressMaintenanceComponent },
  { path: 'client-maintenance/confirm', component: CommonClientMaintenanceConfimComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommonRoutingModule {}
