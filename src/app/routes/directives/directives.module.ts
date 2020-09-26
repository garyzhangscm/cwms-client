import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { DirectivesRoutingModule } from './directives-routing.module';
import { FkeyDirective } from './fkey.directive';
import { NewNumberValidator } from './newNumberValidator';

const COMPONENTS = [];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [SharedModule, DirectivesRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT, FkeyDirective, NewNumberValidator],
  exports: [FkeyDirective, NewNumberValidator],
  entryComponents: COMPONENTS_NOROUNT,
})
export class DirectivesModule {}
