import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { DirectivesRoutingModule } from './directives-routing.module';
import { FkeyDirective } from './fkey.directive';

const COMPONENTS = [];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [SharedModule, DirectivesRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT, FkeyDirective],
  exports: [FkeyDirective],
  entryComponents: COMPONENTS_NOROUNT,
})
export class DirectivesModule {}
