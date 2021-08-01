import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { WorkTaskRoutingModule } from './work-task-routing.module';

const COMPONENTS: Type<void>[] = [];

@NgModule({
  imports: [
    SharedModule,
    WorkTaskRoutingModule
  ],
  declarations: COMPONENTS,
})
export class WorkTaskModule { }
