import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {  aclCanActivate, ACLGuardType } from '@delon/acl';

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
import { InboundPrintingReceivingLpnLabelComponent } from './printing-receiving-lpn-label/printing-receiving-lpn-label.component';
import { InboundInboundReceivingConfigurationComponent } from './inbound-receiving-configuration/inbound-receiving-configuration.component';
import { InboundInboundReceivingConfigurationMaintenanceComponent } from './inbound-receiving-configuration-maintenance/inbound-receiving-configuration-maintenance.component';

const routes: Routes = [

  { path: 'receipt', component: InboundReceiptComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inbound/receipt' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'receipt-maintenance', component: InboundReceiptMaintenanceComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inbound/receipt' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'receipt-confirm', component: InboundReceiptConfirmComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inbound/receipt' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'putaway-configuration', component: InboundPutawayConfigurationComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inbound/putaway-configuration', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'putaway-configuration-maintenance', component: InboundPutawayConfigurationMaintenanceComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inbound/putaway-configuration' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'putaway-configuration-confim', component: InboundPutawayConfigurationConfimComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inbound/putaway-configuration', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'inbound-qc-configuration', component: InboundInboundQcConfigurationComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inbound/inbound-qc-configuration', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'inbound-qc-configuration/maintenance', component: InboundInboundQcConfigurationMaintenanceComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inbound/inbound-qc-configuration' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'customer-return', component: InboundCustomerReturnComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inbound/customer-return', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'customer-return-order/maintenance', component: InboundCustomerReturnOrderMaintenanceComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inbound/customer-return', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'customer-return-receive', component: InboundCustomerReturnReceiveComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inbound/customer-return' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'purchase-order', component: InboundPurchaseOrderComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inbound/purchase-order' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'create-receipt-from-po', component: InboundCreateReceiptFromPoComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inbound/purchase-order' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'printing-receiving-lpn-label', component: InboundPrintingReceivingLpnLabelComponent,
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inbound/printing-receiving-lpn-label', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    } 
  },
  { path: 'inbound-receiving-configuration', component: InboundInboundReceivingConfigurationComponent,
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inbound/inbound-receiving-configuration', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    } 
  },
  { path: 'inbound-receiving-configuration/maintenance', component: InboundInboundReceivingConfigurationMaintenanceComponent,
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inbound/inbound-receiving-configuration/maintenance', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    } 
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InboundRoutingModule { }
