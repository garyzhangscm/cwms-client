import { NgModule, Type } from '@angular/core'; 

import { IntegrationIntegrationDataClientComponent } from './integration-data-client/integration-data-client.component';
import { IntegrationIntegrationDataCustomerComponent } from './integration-data-customer/integration-data-customer.component';
import { IntegrationIntegrationDataInventoryAdjustComponent } from './integration-data-inventory-adjust/integration-data-inventory-adjust.component';
import { IntegrationIntegrationDataInventoryAttributeChangeComponent } from './integration-data-inventory-attribute-change/integration-data-inventory-attribute-change.component';
import { IntegrationIntegrationDataItemFamilyComponent } from './integration-data-item-family/integration-data-item-family.component';
import { IntegrationIntegrationDataItemPackageTypeComponent } from './integration-data-item-package-type/integration-data-item-package-type.component';
import { IntegrationIntegrationDataItemUnitOfMeasureComponent } from './integration-data-item-unit-of-measure/integration-data-item-unit-of-measure.component';
import { IntegrationIntegrationDataItemComponent } from './integration-data-item/integration-data-item.component';
import { IntegrationIntegrationDataOrderConfirmComponent } from './integration-data-order-confirm/integration-data-order-confirm.component';
import { IntegrationIntegrationDataOrderComponent } from './integration-data-order/integration-data-order.component';
import { IntegrationIntegrationDataReceiptConfirmComponent } from './integration-data-receipt-confirm/integration-data-receipt-confirm.component';
import { IntegrationIntegrationDataReceiptComponent } from './integration-data-receipt/integration-data-receipt.component';
import { IntegrationIntegrationDataSupplierComponent } from './integration-data-supplier/integration-data-supplier.component';
import { IntegrationIntegrationDataWorkOrderConfirmComponent } from './integration-data-work-order-confirm/integration-data-work-order-confirm.component';
import { IntegrationIntegrationDataWorkOrderComponent } from './integration-data-work-order/integration-data-work-order.component';
import { IntegrationIntegrationDataComponent } from './integration-data/integration-data.component';
import { IntegrationRoutingModule } from './integration-routing.module';
import { IntegrationTiktokSellerShopIntegrationConfigurationComponent } from './tiktok-seller-shop-integration-configuration/tiktok-seller-shop-integration-configuration.component';
import { IntegrationShopifyIntegrationConfigurationComponent } from './shopify-integration-configuration/shopify-integration-configuration.component';
import { NzResultModule } from 'ng-zorro-antd/result';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@delon/abc/page-header';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { I18nPipe } from '@delon/theme';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CommonModule } from '@angular/common';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { STModule } from '@delon/abc/st';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

const COMPONENTS: Array<Type<void>> =  [
  IntegrationIntegrationDataComponent,
  IntegrationIntegrationDataClientComponent,
  IntegrationIntegrationDataClientComponent,
  IntegrationIntegrationDataCustomerComponent,
  IntegrationIntegrationDataItemComponent,
  IntegrationIntegrationDataItemFamilyComponent,
  IntegrationIntegrationDataItemPackageTypeComponent,
  IntegrationIntegrationDataItemUnitOfMeasureComponent,
  IntegrationIntegrationDataSupplierComponent,
  IntegrationIntegrationDataOrderComponent,
  IntegrationIntegrationDataReceiptComponent,
  IntegrationIntegrationDataReceiptConfirmComponent,
  IntegrationIntegrationDataOrderConfirmComponent,
  IntegrationIntegrationDataInventoryAdjustComponent,
  IntegrationIntegrationDataInventoryAttributeChangeComponent,
  IntegrationIntegrationDataWorkOrderConfirmComponent,
  IntegrationIntegrationDataWorkOrderComponent,
  IntegrationTiktokSellerShopIntegrationConfigurationComponent,
  IntegrationShopifyIntegrationConfigurationComponent];
const COMPONENTS_NOROUNT: Array<Type<void>> = [];

@NgModule({
  imports: [ 
    IntegrationRoutingModule,
    NzResultModule,
    NzFormModule,
    FormsModule, 
    ReactiveFormsModule,
    PageHeaderComponent ,
    NzTabsModule ,
    I18nPipe,
    NzSpinModule ,
    NzDatePickerModule ,
    NzSelectModule,
    NzButtonModule,
    NzIconModule ,
    NzTableModule ,
    CommonModule ,
    NzToolTipModule ,
    STModule,
    NzCardModule ,
    NzInputNumberModule ,
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
})
export class IntegrationModule { }
