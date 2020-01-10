import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OutboundOrderComponent } from './order/order.component';
import { OutboundWaveComponent } from './wave/wave.component';
import { OutboundShipmentComponent } from './shipment/shipment.component';
import { OutboundOrderMaintenanceComponent } from './order-maintenance/order-maintenance.component';
import { OutboundShipmentDisplayComponent } from './shipment-display/shipment-display.component';

const routes: Routes = [
  { path: 'order', component: OutboundOrderComponent },
  { path: 'wave', component: OutboundWaveComponent },
  { path: 'shipment', component: OutboundShipmentComponent },
  { path: 'order-maintenance', component: OutboundOrderMaintenanceComponent },
  { path: 'shipment-display', component: OutboundShipmentDisplayComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OutboundRoutingModule {}
