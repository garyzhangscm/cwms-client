import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {  aclCanActivate, ACLGuardType } from '@delon/acl';

import { CommonAbcCategoryComponent } from './abc-category/abc-category.component';
import { CommonClientAddressMaintenanceComponent } from './client-address-maintenance/client-address-maintenance.component';
import { CommonClientMaintenanceConfimComponent } from './client-maintenance-confim/client-maintenance-confim.component';
import { CommonClientMaintenanceComponent } from './client-maintenance/client-maintenance.component';
import { CommonClientComponent } from './client/client.component';
import { CommonCustomerAddressMaintenanceComponent } from './customer-address-maintenance/customer-address-maintenance.component';
import { CommonCustomerMaintenanceConfirmComponent } from './customer-maintenance-confirm/customer-maintenance-confirm.component';
import { CommonCustomerMaintenanceComponent } from './customer-maintenance/customer-maintenance.component';
import { CommonCustomerComponent } from './customer/customer.component';
import { CommonPrintButtonComponent } from './print-button/print-button.component';
import { CommonReasonCodeMaintenanceComponent } from './reason-code-maintenance/reason-code-maintenance.component';
import { CommonReasonCodeComponent } from './reason-code/reason-code.component';
import { CommonSupplierAddressMaintenanceComponent } from './supplier-address-maintenance/supplier-address-maintenance.component';
import { CommonSupplierMaintenanceConfirmComponent } from './supplier-maintenance-confirm/supplier-maintenance-confirm.component';
import { CommonSupplierMaintenanceComponent } from './supplier-maintenance/supplier-maintenance.component';
import { CommonSupplierComponent } from './supplier/supplier.component';  
import { CommonUnitOfMeasureConfirmComponent } from './unit-of-measure-confirm/unit-of-measure-confirm.component';
import { CommonUnitOfMeasureMaintenanceComponent } from './unit-of-measure-maintenance/unit-of-measure-maintenance.component';
import { CommonUnitOfMeasureComponent } from './unit-of-measure/unit-of-measure.component';
import { CommonVelocityComponent } from './velocity/velocity.component';

const routes: Routes = [
  { path: 'client', component: CommonClientComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/common/client' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'client-maintenance', component: CommonClientMaintenanceComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/common/client' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'client-maintenance/address', component: CommonClientAddressMaintenanceComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/common/client' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'client-maintenance/confirm', component: CommonClientMaintenanceConfimComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/common/client', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'unit-of-measure', component: CommonUnitOfMeasureComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/common/unit-of-measure' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'unit-of-measure-maintenance', component: CommonUnitOfMeasureMaintenanceComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/common/unit-of-measure', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'unit-of-measure/confirm', component: CommonUnitOfMeasureConfirmComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/common/unit-of-measure', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'supplier', component: CommonSupplierComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/common/supplier', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'supplier-maintenance', component: CommonSupplierMaintenanceComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/common/supplier' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'supplier-maintenance/address', component: CommonSupplierAddressMaintenanceComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/common/supplier' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'supplier-maintenance/confirm', component: CommonSupplierMaintenanceConfirmComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/common/supplier', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'customer', component: CommonCustomerComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/common/customer' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'customer-maintenance', component: CommonCustomerMaintenanceComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/common/customer' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'customer-maintenance/confirm', component: CommonCustomerMaintenanceConfirmComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/common/customer' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'customer-maintenance/address', component: CommonCustomerAddressMaintenanceComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/common/customer', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'print-button', component: CommonPrintButtonComponent   ,  
  },
  { path: 'abc-category', component: CommonAbcCategoryComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/common/abc-category' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'velocity', component: CommonVelocityComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/common/velocity' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'reason-code', component: CommonReasonCodeComponent ,
  canActivate: [aclCanActivate], 
  data: { 
    guard:  {
      role: [ '/common/reason-code' , 'admin', 'system-admin' ], 
    } as ACLGuardType,
    guard_url: '/exception/403'
  }},
  { path: 'reason-code/maintenance', component: CommonReasonCodeMaintenanceComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommonRoutingModule { }
