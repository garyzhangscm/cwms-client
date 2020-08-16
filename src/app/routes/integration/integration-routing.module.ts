import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
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
import { IntegrationIntegrationDataInventoryAttributeChangeComponent } from './integration-data-inventory-attribute-change/integration-data-inventory-attribute-change.component';
import { IntegrationIntegrationDataWorkOrderConfirmComponent } from './integration-data-work-order-confirm/integration-data-work-order-confirm.component';

const routes: Routes = [
  { path: 'integration-data', component: IntegrationIntegrationDataComponent },
  { path: 'integration-data-client', component: IntegrationIntegrationDataClientComponent },
  { path: 'integration-data-customer', component: IntegrationIntegrationDataCustomerComponent },
  { path: 'integration-data-item', component: IntegrationIntegrationDataItemComponent },
  { path: 'integration-data-item-family', component: IntegrationIntegrationDataItemFamilyComponent },
  { path: 'integration-data-item-package-type', component: IntegrationIntegrationDataItemPackageTypeComponent },
  { path: 'integration-data-item-unit-of-measure', component: IntegrationIntegrationDataItemUnitOfMeasureComponent },
  { path: 'integration-data-supplier', component: IntegrationIntegrationDataSupplierComponent },
  { path: 'integration-data-order', component: IntegrationIntegrationDataOrderComponent },
  { path: 'integration-data-receipt', component: IntegrationIntegrationDataReceiptComponent },
  { path: 'integration-data-receipt-confirm', component: IntegrationIntegrationDataReceiptConfirmComponent },
  { path: 'integration-data-order-confirm', component: IntegrationIntegrationDataOrderConfirmComponent },
  { path: 'integration-data-inventory-adjust', component: IntegrationIntegrationDataInventoryAdjustComponent },
  {
    path: 'integration-data-inventory-attribute-change',
    component: IntegrationIntegrationDataInventoryAttributeChangeComponent,
  },
  { path: 'integration-data-work-order-confirm', component: IntegrationIntegrationDataWorkOrderConfirmComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IntegrationRoutingModule {}
