import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { IntegrationRoutingModule } from './integration-routing.module';

const COMPONENTS = [];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    IntegrationRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class IntegrationModule { }
