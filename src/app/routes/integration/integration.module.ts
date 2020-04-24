import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { IntegrationRoutingModule } from './integration-routing.module';
import { IntegrationIntegrationDataComponent } from './integration-data/integration-data.component';
import { IntegrationIntegrationDataClientComponent } from './integration-data-client/integration-data-client.component';
import { IntegrationIntegrationDataCustomerComponent } from './integration-data-customer/integration-data-customer.component';
import { IntegrationIntegrationDataItemComponent } from './integration-data-item/integration-data-item.component';
import { IntegrationIntegrationDataItemFamilyComponent } from './integration-data-item-family/integration-data-item-family.component';
import { IntegrationIntegrationDataItemPackageTypeComponent } from './integration-data-item-package-type/integration-data-item-package-type.component';
import { IntegrationIntegrationDataItemUnitOfMeasureComponent } from './integration-data-item-unit-of-measure/integration-data-item-unit-of-measure.component';
import { IntegrationIntegrationDataSupplierComponent } from './integration-data-supplier/integration-data-supplier.component';
import { IntegrationIntegrationDataOrderComponent } from './integration-data-order/integration-data-order.component';
import { IntegrationIntegrationDataReceiptComponent } from './integration-data-receipt/integration-data-receipt.component';
import { IntegrationIntegrationDataReceiptConfirmComponent } from './integration-data-receipt-confirm/integration-data-receipt-confirm.component';
import { IntegrationIntegrationDataOrderConfirmComponent } from './integration-data-order-confirm/integration-data-order-confirm.component';
import { IntegrationIntegrationDataInventoryAdjustComponent } from './integration-data-inventory-adjust/integration-data-inventory-adjust.component';
import { IntegrationIntegrationDataInventoryStatusChangeComponent } from './integration-data-inventory-status-change/integration-data-inventory-status-change.component';

const COMPONENTS = [IntegrationIntegrationDataComponent, IntegrationIntegrationDataClientComponent,
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
  IntegrationIntegrationDataInventoryStatusChangeComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [SharedModule, IntegrationRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT,
})
export class IntegrationModule {}
