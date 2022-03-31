import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { BillingRoutingModule } from './billing-routing.module';
import { BillingRateComponent } from './rate/rate.component';
import { BillingRateMaintenanceComponent } from './rate-maintenance/rate-maintenance.component';
import { BillingInvoiceMaintenanceComponent } from './invoice-maintenance/invoice-maintenance.component';
import { BillingInvoiceComponent } from './invoice/invoice.component';

const COMPONENTS: Type<void>[] = [
  BillingRateComponent,
  BillingRateMaintenanceComponent,
  BillingInvoiceMaintenanceComponent,
  BillingInvoiceComponent];

@NgModule({
  imports: [
    SharedModule,
    BillingRoutingModule
  ],
  declarations: COMPONENTS,
})
export class BillingModule { }
