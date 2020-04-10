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

const routes: Routes = [
  { path: 'integration-data', component: IntegrationIntegrationDataComponent },
  { path: 'integration-data-client', component: IntegrationIntegrationDataClientComponent },
,
  { path: 'integration-data-customer', component: IntegrationIntegrationDataCustomerComponent },
  { path: 'integration-data-item', component: IntegrationIntegrationDataItemComponent },
  { path: 'integration-data-item-family', component: IntegrationIntegrationDataItemFamilyComponent },
  { path: 'integration-data-item-package-type', component: IntegrationIntegrationDataItemPackageTypeComponent },
  { path: 'integration-data-item-unit-of-measure', component: IntegrationIntegrationDataItemUnitOfMeasureComponent },
  { path: 'integration-data-supplier', component: IntegrationIntegrationDataSupplierComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IntegrationRoutingModule {}
