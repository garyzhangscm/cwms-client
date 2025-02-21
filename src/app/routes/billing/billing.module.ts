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
import { BillingVendorInvoiceMaintenanceComponent } from './vendor-invoice-maintenance/vendor-invoice-maintenance.component';
import { BillingBillableActivityTypeComponent } from './billable-activity-type/billable-activity-type.component';
import { BillingBillableActivityTypeMaintenanceComponent } from './billable-activity-type-maintenance/billable-activity-type-maintenance.component';
import { BillingBillableActivityComponent } from './billable-activity/billable-activity.component';

const COMPONENTS: Array<Type<void>> = [
  BillingRateComponent,
  BillingRateMaintenanceComponent,
  BillingInvoiceMaintenanceComponent,
  BillingInvoiceComponent, 
  BillingVendorInvoiceMaintenanceComponent,
  BillingBillableActivityTypeComponent,
  BillingBillableActivityTypeMaintenanceComponent,
  BillingBillableActivityComponent];

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
