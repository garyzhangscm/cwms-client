import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';

import { CommonModule } from '../common/common.module';
import { DirectivesModule } from '../directives/directives.module';
import { InboundRoutingModule } from './inbound-routing.module';
import { InboundPutawayConfigurationConfimComponent } from './putaway-configuration-confim/putaway-configuration-confim.component';
import { InboundPutawayConfigurationMaintenanceComponent } from './putaway-configuration-maintenance/putaway-configuration-maintenance.component';
import { InboundPutawayConfigurationComponent } from './putaway-configuration/putaway-configuration.component';
import { InboundReceiptConfirmComponent } from './receipt-confirm/receipt-confirm.component';
import { InboundReceiptMaintenanceComponent } from './receipt-maintenance/receipt-maintenance.component';
import { InboundReceiptComponent } from './receipt/receipt.component';

const COMPONENTS: Array<Type<void>> = [
  InboundReceiptComponent, InboundReceiptMaintenanceComponent, InboundReceiptConfirmComponent,
  InboundPutawayConfigurationComponent,
  InboundPutawayConfigurationMaintenanceComponent,
  InboundPutawayConfigurationConfimComponent];
  
const COMPONENTS_NOROUNT: Array<Type<void>> = [];

@NgModule({
  imports: [
    SharedModule,
    InboundRoutingModule,
    DirectivesModule,
    CommonModule,
    NzAutocompleteModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
})
export class InboundModule { }
