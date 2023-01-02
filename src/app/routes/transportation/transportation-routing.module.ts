import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TransportationTractorAppointmentMaintenanceComponent } from './tractor-appointment-maintenance/tractor-appointment-maintenance.component';
import { CommonTractorMaintenanceComponent } from './tractor-maintenance/tractor-maintenance.component';
import { TransportationTractorScheduleComponent } from './tractor-schedule/tractor-schedule.component';
import { CommonTractorComponent } from './tractor/tractor.component';
import { TransportationTrailerAppointmentMaintenanceComponent } from './trailer-appointment-maintenance/trailer-appointment-maintenance.component';
import { CommonTrailerMaintenanceComponent } from './trailer-maintenance/trailer-maintenance.component';
import { CommonTrailerComponent } from './trailer/trailer.component';
import { TransportationCarrierComponent } from './carrier/carrier.component';
import { TransportationEasyPostComponent } from './easy-post/easy-post.component';
import { TransportationCarrierMaintenanceComponent } from './carrier-maintenance/carrier-maintenance.component';

const routes: Routes = [
  { path: 'tractor', component: CommonTractorComponent },
  { path: 'tractor/maintenance', component: CommonTractorMaintenanceComponent },
  { path: 'trailer', component: CommonTrailerComponent },
  { path: 'trailer/maintenance', component: CommonTrailerMaintenanceComponent },
  { path: 'trailer/appointment/maintenance', component: TransportationTrailerAppointmentMaintenanceComponent },
  { path: 'tractor/appointment/maintenance', component: TransportationTractorAppointmentMaintenanceComponent },
  { path: 'tractor/schedule', component: TransportationTractorScheduleComponent },
  { path: 'carrier', component: TransportationCarrierComponent },
  { path: 'easy-post', component: TransportationEasyPostComponent },
  { path: 'carrier-maintenance', component: TransportationCarrierMaintenanceComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransportationRoutingModule { }
