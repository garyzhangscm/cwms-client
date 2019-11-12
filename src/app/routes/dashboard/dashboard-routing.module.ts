import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardLocationsComponent } from './locations/locations.component';
import { DashboardDefaultComponent } from './default/default.component';

const routes: Routes = [
  { path: '', redirectTo: 'default' },
  { path: 'locations', component: DashboardLocationsComponent },
  { path: 'default', component: DashboardDefaultComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
