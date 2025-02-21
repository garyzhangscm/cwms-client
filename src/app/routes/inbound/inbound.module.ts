import { NgModule, Type } from '@angular/core';
import { EllipsisModule } from '@delon/abc/ellipsis'; 
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzStepsModule } from 'ng-zorro-antd/steps';


import { DirectivesModule } from '../directives/directives.module';
import { InventoryModule } from '../inventory/inventory.module';
import { OutboundModule } from '../outbound/outbound.module';
import { UtilModule } from '../util/util.module';
import { WarehouseLayoutModule } from '../warehouse-layout/warehouse-layout.module';
import { InboundCreateReceiptFromPoComponent } from './create-receipt-from-po/create-receipt-from-po.component';
import { InboundCustomerReturnOrderMaintenanceComponent } from './customer-return-order-maintenance/customer-return-order-maintenance.component';
import { InboundCustomerReturnReceiveComponent } from './customer-return-receive/customer-return-receive.component';
import { InboundCustomerReturnComponent } from './customer-return/customer-return.component';
import { InboundInboundQcConfigurationMaintenanceComponent } from './inbound-qc-configuration-maintenance/inbound-qc-configuration-maintenance.component';
import { InboundInboundQcConfigurationComponent } from './inbound-qc-configuration/inbound-qc-configuration.component';
import { InboundRoutingModule } from './inbound-routing.module';
import { InboundPurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { InboundPutawayConfigurationConfimComponent } from './putaway-configuration-confim/putaway-configuration-confim.component';
import { InboundPutawayConfigurationMaintenanceComponent } from './putaway-configuration-maintenance/putaway-configuration-maintenance.component';
import { InboundPutawayConfigurationComponent } from './putaway-configuration/putaway-configuration.component';
import { InboundReceiptConfirmComponent } from './receipt-confirm/receipt-confirm.component';
import { InboundReceiptMaintenanceComponent } from './receipt-maintenance/receipt-maintenance.component';
import { InboundReceiptComponent } from './receipt/receipt.component';
import { InboundPrintingReceivingLpnLabelComponent } from './printing-receiving-lpn-label/printing-receiving-lpn-label.component';
import { InboundInboundReceivingConfigurationComponent } from './inbound-receiving-configuration/inbound-receiving-configuration.component';
import { InboundInboundReceivingConfigurationMaintenanceComponent } from './inbound-receiving-configuration-maintenance/inbound-receiving-configuration-maintenance.component';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@delon/abc/page-header';
import { STModule } from '@delon/abc/st';
import { I18nPipe } from '@delon/theme';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { CWMSCommonModule } from '../common/common.module';

const COMPONENTS: Array<Type<void>> = [
  InboundReceiptComponent, InboundReceiptMaintenanceComponent, InboundReceiptConfirmComponent,
  InboundPutawayConfigurationComponent,
  InboundPutawayConfigurationMaintenanceComponent,
  InboundPutawayConfigurationConfimComponent,
  InboundInboundQcConfigurationComponent,
  InboundInboundQcConfigurationMaintenanceComponent,
  InboundCustomerReturnComponent,
  InboundCustomerReturnOrderMaintenanceComponent,
  InboundCustomerReturnReceiveComponent,
  InboundPurchaseOrderComponent,
  InboundCreateReceiptFromPoComponent,
  InboundPrintingReceivingLpnLabelComponent,
  InboundInboundReceivingConfigurationComponent,
  InboundInboundReceivingConfigurationMaintenanceComponent];
  
const COMPONENTS_NOROUNT: Array<Type<void>> = [];

@NgModule({
  imports: [ 
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
    OutboundModule,
    EllipsisModule,
    NzSpinModule ,
    PageHeaderComponent ,
    NzFormModule,
    FormsModule, 
    ReactiveFormsModule,
    STModule,
    I18nPipe,
    NzBreadCrumbModule ,
    NzCardModule ,
    NzDividerModule,
    NzTabsModule ,
    NzToolTipModule ,
    NzTableModule ,
    NzInputNumberModule ,
    NzButtonModule,
    NzSelectModule,
    NzDropDownModule , 
    NzInputModule,
    NzListModule ,
    NzIconModule ,
    NzPopoverModule , 
    CWMSCommonModule,
    
  ],
  providers: [DatePipe],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
})
export class InboundModule { }
