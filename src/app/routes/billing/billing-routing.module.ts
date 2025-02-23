import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { aclCanActivate, ACLGuardType } from '@delon/acl';

import { BillingBillableActivityTypeMaintenanceComponent } from './billable-activity-type-maintenance/billable-activity-type-maintenance.component';
import { BillingBillableActivityTypeComponent } from './billable-activity-type/billable-activity-type.component';
import { BillingInvoiceMaintenanceComponent } from './invoice-maintenance/invoice-maintenance.component';
import { BillingInvoiceComponent } from './invoice/invoice.component'; 
import { BillingRateMaintenanceComponent } from './rate-maintenance/rate-maintenance.component';
import { BillingRateComponent } from './rate/rate.component';
import { BillingVendorInvoiceMaintenanceComponent } from './vendor-invoice-maintenance/vendor-invoice-maintenance.component';
import { BillingBillableActivityComponent } from './billable-activity/billable-activity.component';

const routes: Routes = [

  { path: 'rate', component: BillingRateComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/billing/rate' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'rate/maintenance', component: BillingRateMaintenanceComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/billing/rate' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'invoice/maintenance', component: BillingInvoiceMaintenanceComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/billing/invoice' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'invoice', component: BillingInvoiceComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/billing/invoice', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'invoice/maintenance/vendor', component: BillingVendorInvoiceMaintenanceComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/billing/invoice' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'billable-activity-type', component: BillingBillableActivityTypeComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/billing/billable-activity-type' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'billable-activity-type/maintenance', component: BillingBillableActivityTypeMaintenanceComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/billing/billable-activity-type', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }
  ,
  { path: 'billable-activity', component: BillingBillableActivityComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillingRoutingModule { }
