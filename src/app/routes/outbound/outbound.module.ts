import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { OutboundRoutingModule } from './outbound-routing.module';

const COMPONENTS = [];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    OutboundRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class OutboundModule { }
