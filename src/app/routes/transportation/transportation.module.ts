import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzStepsModule } from 'ng-zorro-antd/steps';

import { DirectivesModule } from '../directives/directives.module';
import { UtilModule } from '../util/util.module';
import { CommonTractorMaintenanceComponent } from './tractor-maintenance/tractor-maintenance.component';
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
  TransportationTrailerAppointmentMaintenanceComponent];

@NgModule({
  imports: [
    SharedModule,
    TransportationRoutingModule,
    NzDescriptionsModule,
    DirectivesModule,
    NzStepsModule,
    UtilModule,
  ],
  declarations: COMPONENTS,
})
export class TransportationModule { }
