import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { DirectivesModule } from '../directives/directives.module';
import { OutboundRoutingModule } from './outbound-routing.module';
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
import { OutboundGridComponent } from './grid/grid.component';
import { OutboundGridMaintenanceComponent } from './grid-maintenance/grid-maintenance.component';

const COMPONENTS = [
  OutboundOrderComponent,
  OutboundWaveComponent,
  OutboundShipmentComponent,
  OutboundOrderMaintenanceComponent,
  OutboundShipmentDisplayComponent,
  OutboundWaveMaintenanceComponent,
  OutboundPickComponent,
  OutboundShortAllocationComponent,
  OutboundStopComponent,
  OutboundTrailerComponent,
  OutboundPickConfirmComponent,
  OutboundPickListComponent,
  OutboundCartonComponent,
  OutboundCartonizationComponent,
  OutboundCartonizationConfigurationComponent,
  OutboundCartonizationConfigurationMaintenanceComponent,
  OutboundCartonizationConfigurationConfirmComponent,
  OutboundGridComponent,
  OutboundGridMaintenanceComponent,
];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [SharedModule, OutboundRoutingModule, DirectivesModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT,
})
export class OutboundModule {}
