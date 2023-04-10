import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { WorkTaskRoutingModule } from './work-task-routing.module';
import { WorkTaskWorkTaskComponent } from './work-task/work-task.component';

const COMPONENTS: Type<void>[] = [
  WorkTaskWorkTaskComponent];

@NgModule({
  imports: [
    SharedModule,
    WorkTaskRoutingModule
  ],
  declarations: COMPONENTS,
})
export class WorkTaskModule { }
