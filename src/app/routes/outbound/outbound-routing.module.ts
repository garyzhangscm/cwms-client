import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ACLGuard, ACLGuardType } from '@delon/acl';

import { AuthGuard } from '../auth/guard/auth.guard';
import { OutboundAllocationConfigurationMaintenanceComponent } from './allocation-configuration-maintenance/allocation-configuration-maintenance.component';
import { OutboundAllocationConfigurationComponent } from './allocation-configuration/allocation-configuration.component';
import { OutboundAllocationTransactionHistoryComponent } from './allocation-transaction-history/allocation-transaction-history.component';
import { OutboundCartonComponent } from './carton/carton.component';
import { OutboundCartonizationConfigurationConfirmComponent } from './cartonization-configuration-confirm/cartonization-configuration-confirm.component';
import { OutboundCartonizationConfigurationMaintenanceComponent } from './cartonization-configuration-maintenance/cartonization-configuration-maintenance.component';
import { OutboundCartonizationConfigurationComponent } from './cartonization-configuration/cartonization-configuration.component';
import { OutboundCartonizationComponent } from './cartonization/cartonization.component';
import { OutboundCompleteOrderComponent } from './complete-order/complete-order.component';
import { OutboundGridMaintenanceComponent } from './grid-maintenance/grid-maintenance.component';
import { OutboundGridComponent } from './grid/grid.component';
import { OutboundListPickConfigurationMaintenanceComponent } from './list-pick-configuration-maintenance/list-pick-configuration-maintenance.component';
import { OutboundListPickConfigurationComponent } from './list-pick-configuration/list-pick-configuration.component';
import { OutboundLoadComponent } from './load/load.component';
import { OutboundOrderActivityComponent } from './order-activity/order-activity.component';
import { OutboundOrderDocumentComponent } from './order-document/order-document.component';
import { OutboundOrderMaintenanceComponent } from './order-maintenance/order-maintenance.component';
import { OutboundOrderComponent } from './order/order.component';
import { OutboundOutboundOrderPopupQueryComponent } from './outbound-order-popup-query/outbound-order-popup-query.component';
import { OutboundParcelByOrderComponent } from './parcel-by-order/parcel-by-order.component';
import {  OutboundPickConfigurationComponent } from './pick-configuration/pick-configuration.component';
import { OutboundPickConfirmComponent } from './pick-confirm/pick-confirm.component';
import { OutboundPickListComponent } from './pick-list/pick-list.component';
import { OutboundPickComponent } from './pick/pick.component';
import { OutboundShipmentDisplayComponent } from './shipment-display/shipment-display.component';
import { OutboundShipmentComponent } from './shipment/shipment.component';
import { OutboundShippingCartonizationComponent } from './shipping-cartonization/shipping-cartonization.component';
import { OutboundShortAllocationComponent } from './short-allocation/short-allocation.component';
import { OutboundStopComponent } from './stop/stop.component';
import { OutboundTrailerComponent } from './trailer/trailer.component';
import { OutboundWaveMaintenanceComponent } from './wave-maintenance/wave-maintenance.component';
import { OutboundWaveComponent } from './wave/wave.component';

const routes: Routes = [
  { path: 'order', component: OutboundOrderComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/order' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'wave', component: OutboundWaveComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/wave' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'shipment', component: OutboundShipmentComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/shipment' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'order-maintenance', component: OutboundOrderMaintenanceComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/order' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'shipment-display', component: OutboundShipmentDisplayComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/shipment-display', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'wave-maintenance', component: OutboundWaveMaintenanceComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/wave' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'pick', component: OutboundPickComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/pick' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'short-allocation', component: OutboundShortAllocationComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/short-allocation', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'stop', component: OutboundStopComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/stop', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'trailer', component: OutboundTrailerComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/trailer' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'pick/confirm', component: OutboundPickConfirmComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/pick' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'pick-list', component: OutboundPickListComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/pick-list', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'carton', component: OutboundCartonComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/carton' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'cartonization', component: OutboundCartonizationComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/cartonization', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'cartonization-configuration', component: OutboundCartonizationConfigurationComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/cartonization-configuration' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  {
    path: 'cartonization-configuration/maintenance',
    component: OutboundCartonizationConfigurationMaintenanceComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/cartonization-configuration', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'cartonization-configuration/confirm', component: OutboundCartonizationConfigurationConfirmComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/cartonization-configuration' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'grid', component: OutboundGridComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/grid' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'grid-maintenance', component: OutboundGridMaintenanceComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/grid' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'shipping-cartonization', component: OutboundShippingCartonizationComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/shipping-cartonization' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'allocation-configuration', component: OutboundAllocationConfigurationComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/allocation-configuration' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'order-activity', component: OutboundOrderActivityComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/order-activity' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'allocation-transaction-history', component: OutboundAllocationTransactionHistoryComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/allocation-transaction-history' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'complete-order', component: OutboundCompleteOrderComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/order' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'outbound-order-popup-query', component: OutboundOutboundOrderPopupQueryComponent , 
  },
  { path: 'allocation-configuration/maintenance', component: OutboundAllocationConfigurationMaintenanceComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/allocation-configuration', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'load', component: OutboundLoadComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/load' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'order-document', component: OutboundOrderDocumentComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/order' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'list-pick-configuration', component: OutboundListPickConfigurationComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/list-pick-configuration' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'list-pick-configuration/maintenance', component: OutboundListPickConfigurationMaintenanceComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/list-pick-configuration' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'parcel-by-order', component: OutboundParcelByOrderComponent, 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/parcel-by-order' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'pick-configuration', component: OutboundPickConfigurationComponent,  
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/outbound/pick-configuration' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OutboundRoutingModule { }
