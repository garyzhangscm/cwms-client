import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { DirectivesRoutingModule } from './directives-routing.module';

const COMPONENTS: Type<void>[] = [];

@NgModule({
  imports: [
    SharedModule,
    DirectivesRoutingModule
  ],
  declarations: COMPONENTS,
})
export class DirectivesModule { }
