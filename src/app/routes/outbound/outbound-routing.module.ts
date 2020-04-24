import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OutboundOrderComponent } from './order/order.component';
import { OutboundWaveComponent } from './wave/wave.component';
import { OutboundShipmentComponent } from './shipment/shipment.component';
import { OutboundOrderMaintenanceComponent } from './order-maintenance/order-maintenance.component';
import { OutboundShipmentDisplayComponent } from './shipment-display/shipment-display.component';
import { OutboundWaveMaintenanceComponent } from './wave-maintenance/wave-maintenance.component';
import { OutboundPickComponent } from './pick/pick.component';
import { OutboundShortAllocationComponent } from './short-allocation/short-allocation.component';
import { OutboundStopComponent } from './stop/stop.component';
import { OutboundTrailerComponent } from './trailer/trailer.component';
import { OutboundPickConfirmComponent } from './pick-confirm/pick-confirm.component';
import { OutboundPickListComponent } from './pick-list/pick-list.component';
import { OutboundCartonComponent } from './carton/carton.component';
import { OutboundCartonizationComponent } from './cartonization/cartonization.component';
import { OutboundCartonizationConfigurationComponent } from './cartonization-configuration/cartonization-configuration.component';
import { OutboundCartonizationConfigurationMaintenanceComponent } from './cartonization-configuration-maintenance/cartonization-configuration-maintenance.component';
import { OutboundCartonizationConfigurationConfirmComponent } from './cartonization-configuration-confirm/cartonization-configuration-confirm.component';

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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OutboundRoutingModule {}
