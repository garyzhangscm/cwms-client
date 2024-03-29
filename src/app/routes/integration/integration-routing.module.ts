import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ACLGuard, ACLGuardType } from '@delon/acl';

import { AuthGuard } from '../auth/guard/auth.guard';
import { IntegrationIntegrationDataClientComponent } from './integration-data-client/integration-data-client.component';
import { IntegrationIntegrationDataCustomerComponent } from './integration-data-customer/integration-data-customer.component';
import { IntegrationIntegrationDataInventoryAdjustComponent } from './integration-data-inventory-adjust/integration-data-inventory-adjust.component';
import { IntegrationIntegrationDataInventoryAttributeChangeComponent } from './integration-data-inventory-attribute-change/integration-data-inventory-attribute-change.component';
import { IntegrationIntegrationDataItemFamilyComponent } from './integration-data-item-family/integration-data-item-family.component';
import { IntegrationIntegrationDataItemPackageTypeComponent } from './integration-data-item-package-type/integration-data-item-package-type.component';
import { IntegrationIntegrationDataItemUnitOfMeasureComponent } from './integration-data-item-unit-of-measure/integration-data-item-unit-of-measure.component';
import { IntegrationIntegrationDataItemComponent } from './integration-data-item/integration-data-item.component';
import { IntegrationIntegrationDataOrderConfirmComponent } from './integration-data-order-confirm/integration-data-order-confirm.component';
import { IntegrationIntegrationDataOrderComponent } from './integration-data-order/integration-data-order.component';
import { IntegrationIntegrationDataReceiptConfirmComponent } from './integration-data-receipt-confirm/integration-data-receipt-confirm.component';
import { IntegrationIntegrationDataReceiptComponent } from './integration-data-receipt/integration-data-receipt.component';
import { IntegrationIntegrationDataSupplierComponent } from './integration-data-supplier/integration-data-supplier.component';
import { IntegrationIntegrationDataWorkOrderConfirmComponent } from './integration-data-work-order-confirm/integration-data-work-order-confirm.component';
import { IntegrationIntegrationDataWorkOrderComponent } from './integration-data-work-order/integration-data-work-order.component';
import { IntegrationIntegrationDataComponent } from './integration-data/integration-data.component';

const routes: Routes = [
  { path: 'integration-data', component: IntegrationIntegrationDataComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/integration/integration-data' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'integration-data-client', component: IntegrationIntegrationDataClientComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/integration/integration-data-client' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'integration-data-customer', component: IntegrationIntegrationDataCustomerComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/integration/integration-data-customer' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'integration-data-item', component: IntegrationIntegrationDataItemComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/integration/integration-data-item' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'integration-data-item-family', component: IntegrationIntegrationDataItemFamilyComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/integration/integration-data-item-family', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'integration-data-item-package-type', component: IntegrationIntegrationDataItemPackageTypeComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/integration/integration-data-item-package-type', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'integration-data-item-unit-of-measure', component: IntegrationIntegrationDataItemUnitOfMeasureComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/integration/integration-data-item-unit-of-measure', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'integration-data-supplier', component: IntegrationIntegrationDataSupplierComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/integration/integration-data-supplier' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'integration-data-order', component: IntegrationIntegrationDataOrderComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/integration/integration-data-order' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'integration-data-receipt', component: IntegrationIntegrationDataReceiptComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/integration/integration-data-receipt', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'integration-data-receipt-confirm', component: IntegrationIntegrationDataReceiptConfirmComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/integration/integration-data-receipt-confirm' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'integration-data-order-confirm', component: IntegrationIntegrationDataOrderConfirmComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/integration/integration-data-order-confirm', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'integration-data-inventory-adjust', component: IntegrationIntegrationDataInventoryAdjustComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/integration/integration-data-inventory-adjust', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  {
    path: 'integration-data-inventory-attribute-change',
    component: IntegrationIntegrationDataInventoryAttributeChangeComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/integration/integration-data-inventory-attribute-change', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'integration-data-work-order-confirm', component: IntegrationIntegrationDataWorkOrderConfirmComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/integration/integration-data-work-order-confirm' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'integration-data-work-order', component: IntegrationIntegrationDataWorkOrderComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/integration/integration-data-work-order', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IntegrationRoutingModule { }
