import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { WorkTaskRoutingModule } from './work-task-routing.module';
import { WorkTaskWorkTaskComponent } from './work-task/work-task.component';

const COMPONENTS: Type<void>[] =  [
  WorkTaskWorkTaskComponent];
const COMPONENTS_NOROUNT: Type<void>[] = [];

@NgModule({
  imports: [
    SharedModule,
    WorkTaskRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
})
export class WorkTaskModule { }
