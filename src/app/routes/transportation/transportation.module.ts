import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete';
import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@delon/abc/page-header';
import { STModule } from '@delon/abc/st';
import { I18nPipe } from '@delon/theme';
import { Loader } from '@googlemaps/js-api-loader';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStepsModule } from 'ng-zorro-antd/steps'; 
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

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
    TransportationRoutingModule,
    NzDescriptionsModule,
    DirectivesModule,
    NzStepsModule,
    UtilModule,
    NzCalendarModule, 
    NzFormModule,
    FormsModule, 
    ReactiveFormsModule,
    PageHeaderComponent ,
    I18nPipe,
    NzSpinModule ,
    NzButtonModule,
    STModule,
    NzTabsModule ,
    NzTableModule ,
    NzDropDownModule ,
    NzBreadCrumbModule ,    
    NzSelectModule,
    NzDividerModule,
    NzCardModule ,
    NzInputModule ,
    NzIconModule ,
    NzPopoverModule ,
    NzBadgeModule ,
    NzProgressModule,
    CommonModule ,
    NzToolTipModule ,
    NzInputNumberModule ,
    NgxGpAutocompleteModule,
    NzCheckboxModule ,
  ],
  declarations: COMPONENTS,
  providers: [
     {
       provide: Loader,
       useValue: new Loader({
         apiKey: 'AIzaSyDkPmh0PEC7JTCutUhWuN3BUU38M2fvR5s',
         libraries: ['places']
       })
     }, 
   ],
})
export class TransportationModule { }
