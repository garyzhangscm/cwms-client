import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { InboundRoutingModule } from './inbound-routing.module';
import { InboundReceiptComponent } from './receipt/receipt.component';
import { InboundReceiptMaintenanceComponent } from './receipt-maintenance/receipt-maintenance.component';
import { InboundReceiptConfirmComponent } from './receipt-confirm/receipt-confirm.component';
import { DirectivesModule } from '../directives/directives.module';
import { InboundPutawayConfigurationComponent } from './putaway-configuration/putaway-configuration.component';
import { InboundPutawayConfigurationMaintenanceComponent } from './putaway-configuration-maintenance/putaway-configuration-maintenance.component';
import { InboundPutawayConfigurationConfimComponent } from './putaway-configuration-confim/putaway-configuration-confim.component';

const COMPONENTS = [InboundReceiptComponent, InboundReceiptMaintenanceComponent, InboundReceiptConfirmComponent,
  InboundPutawayConfigurationComponent,
  InboundPutawayConfigurationMaintenanceComponent,
  InboundPutawayConfigurationConfimComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [SharedModule, InboundRoutingModule, DirectivesModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT,
})
export class InboundModule {}
