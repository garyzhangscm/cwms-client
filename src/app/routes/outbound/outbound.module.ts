import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { OutboundRoutingModule } from './outbound-routing.module';
import { OutboundOrderComponent } from './order/order.component';
import { OutboundWaveComponent } from './wave/wave.component';
import { OutboundShipmentComponent } from './shipment/shipment.component';
import { OutboundOrderMaintenanceComponent } from './order-maintenance/order-maintenance.component';
import { OutboundShipmentDisplayComponent } from './shipment-display/shipment-display.component';

const COMPONENTS = [
  OutboundOrderComponent,
  OutboundWaveComponent,
  OutboundShipmentComponent,
  OutboundOrderMaintenanceComponent,
  OutboundShipmentDisplayComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    OutboundRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class OutboundModule { }
