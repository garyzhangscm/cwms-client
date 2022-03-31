import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BillingInvoiceMaintenanceComponent } from './invoice-maintenance/invoice-maintenance.component';
import { BillingInvoiceComponent } from './invoice/invoice.component';
import { BillingRateMaintenanceComponent } from './rate-maintenance/rate-maintenance.component';
import { BillingRateComponent } from './rate/rate.component';

const routes: Routes = [

  { path: 'rate', component: BillingRateComponent },
  { path: 'rate/maintenance', component: BillingRateMaintenanceComponent },
  { path: 'invoice/maintenance', component: BillingInvoiceMaintenanceComponent },
  { path: 'invoice', component: BillingInvoiceComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillingRoutingModule { }
