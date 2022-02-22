import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CommonTractorMaintenanceComponent } from './tractor-maintenance/tractor-maintenance.component';
import { CommonTractorComponent } from './tractor/tractor.component';
import { TransportationTrailerAppointmentMaintenanceComponent } from './trailer-appointment-maintenance/trailer-appointment-maintenance.component';
import { CommonTrailerMaintenanceComponent } from './trailer-maintenance/trailer-maintenance.component';
import { CommonTrailerComponent } from './trailer/trailer.component';

const routes: Routes = [
  { path: 'tractor', component: CommonTractorComponent },
  { path: 'tractor/maintenance', component: CommonTractorMaintenanceComponent },
  { path: 'trailer', component: CommonTrailerComponent },
  { path: 'trailer/maintenance', component: CommonTrailerMaintenanceComponent }
,
  { path: 'trailer/appointment/maintenance', component: TransportationTrailerAppointmentMaintenanceComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransportationRoutingModule { }
