import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

import { DirectivesModule } from '../directives/directives.module';
import { UtilModule } from '../util/util.module';
import { TransportationCarrierMaintenanceComponent } from './carrier-maintenance/carrier-maintenance.component';
import { TransportationCarrierComponent } from './carrier/carrier.component';
import { TransportationEasyPostComponent } from './easy-post/easy-post.component';
import { TransportationTractorAppointmentMaintenanceComponent } from './tractor-appointment-maintenance/tractor-appointment-maintenance.component';
import { CommonTractorMaintenanceComponent } from './tractor-maintenance/tractor-maintenance.component';
import { TransportationTractorScheduleComponent } from './tractor-schedule/tractor-schedule.component';
import { CommonTractorComponent } from './tractor/tractor.component';
import { TransportationTrailerAppointmentMaintenanceComponent } from './trailer-appointment-maintenance/trailer-appointment-maintenance.component';
import { CommonTrailerMaintenanceComponent } from './trailer-maintenance/trailer-maintenance.component';
import { CommonTrailerComponent } from './trailer/trailer.component';
import { TransportationRoutingModule } from './transportation-routing.module';

const COMPONENTS: Array<Type<void>> = [
  CommonTractorComponent,
  CommonTractorMaintenanceComponent,
  CommonTrailerComponent,
  CommonTrailerMaintenanceComponent,
  TransportationTrailerAppointmentMaintenanceComponent,
  TransportationTractorAppointmentMaintenanceComponent,
  TransportationTractorScheduleComponent,
  TransportationCarrierComponent,
  TransportationEasyPostComponent,
  TransportationCarrierMaintenanceComponent];

@NgModule({
  imports: [
    SharedModule,
    TransportationRoutingModule,
    NzDescriptionsModule,
    DirectivesModule,
    NzStepsModule,
    UtilModule,
    NzCalendarModule, 
  ],
  declarations: COMPONENTS,
})
export class TransportationModule { }
