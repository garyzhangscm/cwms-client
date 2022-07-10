import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzStepsModule } from 'ng-zorro-antd/steps';

import { CommonModule } from '../common/common.module';
import { DirectivesModule } from '../directives/directives.module';
import { InventoryModule } from '../inventory/inventory.module';
import { OutboundModule } from '../outbound/outbound.module';
import { UtilModule } from '../util/util.module';
import { WarehouseLayoutModule } from '../warehouse-layout/warehouse-layout.module';
import { InboundCustomerReturnOrderMaintenanceComponent } from './customer-return-order-maintenance/customer-return-order-maintenance.component';
import { InboundCustomerReturnReceiveComponent } from './customer-return-receive/customer-return-receive.component';
import { InboundCustomerReturnComponent } from './customer-return/customer-return.component';
import { InboundInboundQcConfigurationMaintenanceComponent } from './inbound-qc-configuration-maintenance/inbound-qc-configuration-maintenance.component';
import { InboundInboundQcConfigurationComponent } from './inbound-qc-configuration/inbound-qc-configuration.component';
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
  InboundPutawayConfigurationConfimComponent,
  InboundInboundQcConfigurationComponent,
  InboundInboundQcConfigurationMaintenanceComponent,
  InboundCustomerReturnComponent,
  InboundCustomerReturnOrderMaintenanceComponent,
  InboundCustomerReturnReceiveComponent];
  
const COMPONENTS_NOROUNT: Array<Type<void>> = [];

@NgModule({
  imports: [
    SharedModule,
    InboundRoutingModule,
    DirectivesModule,
    CommonModule,
    NzAutocompleteModule,
    UtilModule, 
    NzStepsModule,
    InventoryModule, 
    NzDescriptionsModule,
    WarehouseLayoutModule,
    NzSkeletonModule ,
    OutboundModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
})
export class InboundModule { }
