import { NgModule, Type } from '@angular/core'; 
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzCascaderModule } from 'ng-zorro-antd/cascader';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzStepsModule } from 'ng-zorro-antd/steps'; 

import { AuthModule } from '../auth/auth.module';
import { CWMSCommonModule } from '../common/common.module';
import { DirectivesModule } from '../directives/directives.module';
import { WarehouseLocalTime } from "../directives/warehouse-local-time.pipe";
import { InventoryModule } from '../inventory/inventory.module';
import { UtilModule } from '../util/util.module';
import { WarehouseLayoutModule } from '../warehouse-layout/warehouse-layout.module'; 
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
import { OutboundHualeiConfigurationComponent } from './hualei-configuration/hualei-configuration.component';
import { OutboundListPickConfigurationMaintenanceComponent } from './list-pick-configuration-maintenance/list-pick-configuration-maintenance.component';
import { OutboundListPickConfigurationComponent } from './list-pick-configuration/list-pick-configuration.component';
import { OutboundLoadComponent } from './load/load.component';
import { OutboundOrderActivityComponent } from './order-activity/order-activity.component';
import { OutboundOrderDocumentComponent } from './order-document/order-document.component';
import { OutboundOrderMaintenanceComponent } from './order-maintenance/order-maintenance.component';
import { OutboundOrderTargetShippingCartonLabelComponent } from './order-target-shipping-carton-label/order-target-shipping-carton-label.component';
import { OutboundOrderWalmartShippingCartonLabelComponent } from './order-walmart-shipping-carton-label/order-walmart-shipping-carton-label.component';
import { OutboundOrderComponent } from './order/order.component';
import { OutboundOutboundConfigurationComponent } from './outbound-configuration/outbound-configuration.component';
import { OutboundOutboundOrderPopupQueryComponent } from './outbound-order-popup-query/outbound-order-popup-query.component';
import { OutboundRoutingModule } from './outbound-routing.module';
import { OutboundParcelByOrderComponent } from './parcel-by-order/parcel-by-order.component';
import { OutboundParcelPackageMaintenanceComponent } from './parcel-package-maintenance/parcel-package-maintenance.component';
import { OutboundPickConfigurationComponent } from './pick-configuration/pick-configuration.component';
import { OutboundPickConfirmComponent } from './pick-confirm/pick-confirm.component';
import { OutboundPickListComponent } from './pick-list/pick-list.component';
import { OutboundPickComponent } from './pick/pick.component';
import { OutboundShipByHualeiComponent } from './ship-by-hualei/ship-by-hualei.component';
import { OutboundShipmentDisplayComponent } from './shipment-display/shipment-display.component';
import { OutboundShipmentComponent } from './shipment/shipment.component';
import { OutboundShippingCartonizationComponent } from './shipping-cartonization/shipping-cartonization.component';
import { OutboundShortAllocationComponent } from './short-allocation/short-allocation.component';
import { OutboundStopComponent } from './stop/stop.component';
import { OutboundTrailerComponent } from './trailer/trailer.component';
import { OutboundWaveMaintenanceComponent } from './wave-maintenance/wave-maintenance.component';
import { OutboundWaveComponent } from './wave/wave.component';
import { OutboundPickConfirmStrategyComponent } from './pick-confirm-strategy/pick-confirm-strategy.component';
import { OutboundPickConfirmStrategyMaintenanceComponent } from './pick-confirm-strategy-maintenance/pick-confirm-strategy-maintenance.component';
import { OutboundCompleteWaveComponent } from './complete-wave/complete-wave.component';
import { DatePipe } from '@angular/common';
import { OutboundSortationComponent } from './sortation/sortation.component';
import { OutboundSortationByShipmentComponent } from './sortation-by-shipment/sortation-by-shipment.component';

const COMPONENTS: Array<Type<void>> = [
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
  OutboundShippingCartonizationComponent,
  OutboundAllocationConfigurationComponent,
  OutboundOrderActivityComponent,
  OutboundAllocationTransactionHistoryComponent,
  OutboundCompleteOrderComponent,
  OutboundOutboundOrderPopupQueryComponent,
  OutboundAllocationConfigurationMaintenanceComponent,
  OutboundLoadComponent,
  OutboundOrderDocumentComponent,
  OutboundListPickConfigurationComponent,
  OutboundListPickConfigurationMaintenanceComponent,
  OutboundParcelByOrderComponent,
  OutboundPickConfigurationComponent,
  OutboundHualeiConfigurationComponent,
  OutboundShipByHualeiComponent,
  OutboundParcelPackageMaintenanceComponent,
  OutboundOrderWalmartShippingCartonLabelComponent,
  OutboundOutboundConfigurationComponent ,
  OutboundOrderTargetShippingCartonLabelComponent,
  OutboundPickConfirmStrategyComponent,
  OutboundPickConfirmStrategyMaintenanceComponent,
  OutboundCompleteWaveComponent,
  OutboundSortationComponent,
  OutboundSortationByShipmentComponent];
const COMPONENTS_NOROUNT: Array<Type<void>> = [];

@NgModule({
    declarations: [
        ...COMPONENTS,
        ...COMPONENTS_NOROUNT
    ],
    exports: [OutboundOutboundOrderPopupQueryComponent],
    imports: [ 
        OutboundRoutingModule,
        DirectivesModule,
        NzDescriptionsModule,
        NzStatisticModule,
        CWMSCommonModule,
        NzStepsModule,
        UtilModule,
        NzAutocompleteModule, 
        NzSkeletonModule,
        InventoryModule,
        WarehouseLayoutModule,
        NzLayoutModule,
        AuthModule,
        NzResultModule,
        NzCascaderModule,
        NzListModule,
        WarehouseLocalTime
    ],
    providers: [DatePipe],
})
export class OutboundModule { }
