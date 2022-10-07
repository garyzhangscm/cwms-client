import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

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
  { path: 'order', component: OutboundOrderComponent, canActivate: [AuthGuard]  },
  { path: 'wave', component: OutboundWaveComponent, canActivate: [AuthGuard]  },
  { path: 'shipment', component: OutboundShipmentComponent, canActivate: [AuthGuard]  },
  { path: 'order-maintenance', component: OutboundOrderMaintenanceComponent },
  { path: 'shipment-display', component: OutboundShipmentDisplayComponent },
  { path: 'wave-maintenance', component: OutboundWaveMaintenanceComponent },
  { path: 'pick', component: OutboundPickComponent, canActivate: [AuthGuard]  },
  { path: 'short-allocation', component: OutboundShortAllocationComponent, canActivate: [AuthGuard]  },
  { path: 'stop', component: OutboundStopComponent },
  { path: 'trailer', component: OutboundTrailerComponent, canActivate: [AuthGuard]  },
  { path: 'pick/confirm', component: OutboundPickConfirmComponent, canActivate: [AuthGuard]  },
  { path: 'pick-list', component: OutboundPickListComponent, canActivate: [AuthGuard]  },
  { path: 'carton', component: OutboundCartonComponent, canActivate: [AuthGuard]  },
  { path: 'cartonization', component: OutboundCartonizationComponent, canActivate: [AuthGuard]  },
  { path: 'cartonization-configuration', component: OutboundCartonizationConfigurationComponent, canActivate: [AuthGuard]  },
  {
    path: 'cartonization-configuration/maintenance',
    component: OutboundCartonizationConfigurationMaintenanceComponent,
  },
  { path: 'cartonization-configuration/confirm', component: OutboundCartonizationConfigurationConfirmComponent },
  { path: 'grid', component: OutboundGridComponent, canActivate: [AuthGuard]  },
  { path: 'grid-maintenance', component: OutboundGridMaintenanceComponent },
  { path: 'shipping-cartonization', component: OutboundShippingCartonizationComponent, canActivate: [AuthGuard]  },
  { path: 'allocation-configuration', component: OutboundAllocationConfigurationComponent, canActivate: [AuthGuard]  },
  { path: 'order-activity', component: OutboundOrderActivityComponent },
  { path: 'allocation-transaction-history', component: OutboundAllocationTransactionHistoryComponent },
  { path: 'complete-order', component: OutboundCompleteOrderComponent },
  { path: 'outbound-order-popup-query', component: OutboundOutboundOrderPopupQueryComponent },
  { path: 'allocation-configuration/maintenance', component: OutboundAllocationConfigurationMaintenanceComponent },
  { path: 'load', component: OutboundLoadComponent },
  { path: 'order-document', component: OutboundOrderDocumentComponent },
  { path: 'list-pick-configuration', component: OutboundListPickConfigurationComponent },
  { path: 'list-pick-configuration/maintenance', component: OutboundListPickConfigurationMaintenanceComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OutboundRoutingModule { }
