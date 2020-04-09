import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IntegrationIntegrationDataComponent } from './integration-data/integration-data.component';
import { IntegrationIntegrationDataClientComponent } from './integration-data-client/integration-data-client.component';

const routes: Routes = [
  { path: 'integration-data', component: IntegrationIntegrationDataComponent },
  { path: 'integration-data-client', component: IntegrationIntegrationDataClientComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IntegrationRoutingModule {}
