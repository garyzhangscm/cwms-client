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
import { CommonModule, DatePipe } from '@angular/common';
import { OutboundSortationComponent } from './sortation/sortation.component';
import { OutboundSortationByShipmentComponent } from './sortation-by-shipment/sortation-by-shipment.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@delon/abc/page-header';
import { STModule } from '@delon/abc/st';
import { I18nPipe } from '@delon/theme';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete';
import { Loader } from '@googlemaps/js-api-loader';
import { NzRadioModule } from 'ng-zorro-antd/radio';

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
        WarehouseLocalTime,
        STModule,        
        NzFormModule,
        FormsModule, 
        ReactiveFormsModule,
        PageHeaderComponent ,
        I18nPipe,
        NzSpinModule ,
        NzSelectModule,
        NzButtonModule,
        NzIconModule ,
        NzTableModule,
        NzDropDownModule ,
        NzBreadCrumbModule ,
        NzCardModule ,
        NzInputModule ,
        NzInputNumberModule ,
        NzDividerModule,
        NzCheckboxModule ,
        NzModalModule,
        NzTabsModule ,
        CommonModule ,
        NzBadgeModule ,
        NzProgressModule,
        NzToolTipModule ,
        NzDatePickerModule ,
        NzUploadModule ,
        NzAlertModule ,
        CommonModule,
        NgxGpAutocompleteModule,
        NzRadioModule,
        
    ],
    providers: [DatePipe, 
        {
            provide: Loader,
            useValue: new Loader({
              apiKey: 'AIzaSyDkPmh0PEC7JTCutUhWuN3BUU38M2fvR5s',
              libraries: ['places']
            })
          }, 
        ],
})
export class OutboundModule { }
