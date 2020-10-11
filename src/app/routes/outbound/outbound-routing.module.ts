import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OutboundAllocationConfigurationComponent } from './allocation-configuration/allocation-configuration.component';
import { OutboundCartonComponent } from './carton/carton.component';
import { OutboundCartonizationConfigurationConfirmComponent } from './cartonization-configuration-confirm/cartonization-configuration-confirm.component';
import { OutboundCartonizationConfigurationMaintenanceComponent } from './cartonization-configuration-maintenance/cartonization-configuration-maintenance.component';
import { OutboundCartonizationConfigurationComponent } from './cartonization-configuration/cartonization-configuration.component';
import { OutboundCartonizationComponent } from './cartonization/cartonization.component';
import { OutboundGridMaintenanceComponent } from './grid-maintenance/grid-maintenance.component';
import { OutboundGridComponent } from './grid/grid.component';
import { OutboundOrderMaintenanceComponent } from './order-maintenance/order-maintenance.component';
import { OutboundOrderComponent } from './order/order.component';
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
  { path: 'order', component: OutboundOrderComponent },
  { path: 'wave', component: OutboundWaveComponent },
  { path: 'shipment', component: OutboundShipmentComponent },
  { path: 'order-maintenance', component: OutboundOrderMaintenanceComponent },
  { path: 'shipment-display', component: OutboundShipmentDisplayComponent },
  { path: 'wave-maintenance', component: OutboundWaveMaintenanceComponent },
  { path: 'pick', component: OutboundPickComponent },
  { path: 'short-allocation', component: OutboundShortAllocationComponent },
  { path: 'stop', component: OutboundStopComponent },
  { path: 'trailer', component: OutboundTrailerComponent },
  { path: 'pick/confirm', component: OutboundPickConfirmComponent },
  { path: 'pick-list', component: OutboundPickListComponent },
  { path: 'carton', component: OutboundCartonComponent },
  { path: 'cartonization', component: OutboundCartonizationComponent },
  { path: 'cartonization-configuration', component: OutboundCartonizationConfigurationComponent },
  {
    path: 'cartonization-configuration/maintenance',
    component: OutboundCartonizationConfigurationMaintenanceComponent,
  },
  { path: 'cartonization-configuration/confirm', component: OutboundCartonizationConfigurationConfirmComponent },
  { path: 'grid', component: OutboundGridComponent },
  { path: 'grid-maintenance', component: OutboundGridMaintenanceComponent },
  { path: 'shipping-cartonization', component: OutboundShippingCartonizationComponent },
  { path: 'allocation-configuration', component: OutboundAllocationConfigurationComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OutboundRoutingModule { }
