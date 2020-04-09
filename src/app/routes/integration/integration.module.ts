import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { IntegrationRoutingModule } from './integration-routing.module';
import { IntegrationIntegrationDataComponent } from './integration-data/integration-data.component';
import { IntegrationIntegrationDataClientComponent } from './integration-data-client/integration-data-client.component';

const COMPONENTS = [IntegrationIntegrationDataComponent, IntegrationIntegrationDataClientComponent,
  IntegrationIntegrationDataClientComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [SharedModule, IntegrationRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT,
})
export class IntegrationModule {}
