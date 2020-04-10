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

const COMPONENTS = [IntegrationIntegrationDataComponent, IntegrationIntegrationDataClientComponent,
  IntegrationIntegrationDataClientComponent,
  IntegrationIntegrationDataCustomerComponent,
  IntegrationIntegrationDataItemComponent,
  IntegrationIntegrationDataItemFamilyComponent,
  IntegrationIntegrationDataItemPackageTypeComponent,
  IntegrationIntegrationDataItemUnitOfMeasureComponent,
  IntegrationIntegrationDataSupplierComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [SharedModule, IntegrationRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT,
})
export class IntegrationModule {}
