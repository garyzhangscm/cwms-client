import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ACLGuard, ACLGuardType } from '@delon/acl';

import { AuthGuard } from '../auth/guard/auth.guard';
import { InboundCreateReceiptFromPoComponent } from './create-receipt-from-po/create-receipt-from-po.component';
import { InboundCustomerReturnOrderMaintenanceComponent } from './customer-return-order-maintenance/customer-return-order-maintenance.component';
import { InboundCustomerReturnReceiveComponent } from './customer-return-receive/customer-return-receive.component';
import { InboundCustomerReturnComponent } from './customer-return/customer-return.component';
import { InboundInboundQcConfigurationMaintenanceComponent } from './inbound-qc-configuration-maintenance/inbound-qc-configuration-maintenance.component';
import { InboundInboundQcConfigurationComponent } from './inbound-qc-configuration/inbound-qc-configuration.component';
import { InboundPurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { InboundPutawayConfigurationConfimComponent } from './putaway-configuration-confim/putaway-configuration-confim.component';
import { InboundPutawayConfigurationMaintenanceComponent } from './putaway-configuration-maintenance/putaway-configuration-maintenance.component';
import { InboundPutawayConfigurationComponent } from './putaway-configuration/putaway-configuration.component';
import { InboundReceiptConfirmComponent } from './receipt-confirm/receipt-confirm.component';
import { InboundReceiptMaintenanceComponent } from './receipt-maintenance/receipt-maintenance.component';
import { InboundReceiptComponent } from './receipt/receipt.component';

const routes: Routes = [

  { path: 'receipt', component: InboundReceiptComponent   , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/inbound/receipt' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'receipt-maintenance', component: InboundReceiptMaintenanceComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/inbound/receipt' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'receipt-confirm', component: InboundReceiptConfirmComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/inbound/receipt' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'putaway-configuration', component: InboundPutawayConfigurationComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/inbound/putaway-configuration', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'putaway-configuration-maintenance', component: InboundPutawayConfigurationMaintenanceComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/inbound/putaway-configuration' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'putaway-configuration-confim', component: InboundPutawayConfigurationConfimComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/inbound/putaway-configuration', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'inbound-qc-configuration', component: InboundInboundQcConfigurationComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/inbound/inbound-qc-configuration', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'inbound-qc-configuration/maintenance', component: InboundInboundQcConfigurationMaintenanceComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/inbound/inbound-qc-configuration' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'customer-return', component: InboundCustomerReturnComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/inbound/customer-return', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'customer-return-order/maintenance', component: InboundCustomerReturnOrderMaintenanceComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/inbound/customer-return', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'customer-return-receive', component: InboundCustomerReturnReceiveComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/inbound/customer-return' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'purchase-order', component: InboundPurchaseOrderComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/inbound/purchase-order' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'create-receipt-from-po', component: InboundCreateReceiptFromPoComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/inbound/purchase-order' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InboundRoutingModule { }
