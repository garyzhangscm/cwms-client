import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzStepsModule } from 'ng-zorro-antd/steps';

import { DirectivesModule } from '../directives/directives.module';
import { BillingRoutingModule } from './billing-routing.module';
import { BillingInvoiceMaintenanceComponent } from './invoice-maintenance/invoice-maintenance.component';
import { BillingInvoiceComponent } from './invoice/invoice.component';
import { BillingRateMaintenanceComponent } from './rate-maintenance/rate-maintenance.component';
import { BillingRateComponent } from './rate/rate.component';

const COMPONENTS: Array<Type<void>> = [
  BillingRateComponent,
  BillingRateMaintenanceComponent,
  BillingInvoiceMaintenanceComponent,
  BillingInvoiceComponent];

@NgModule({
  imports: [
    SharedModule,
    BillingRoutingModule,
    NzStepsModule,
    DirectivesModule,
    NzDescriptionsModule 
  ],
  declarations: COMPONENTS,
})
export class BillingModule { }
