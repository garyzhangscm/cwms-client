import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { WorkTaskRoutingModule } from './work-task-routing.module';
import { WorkTaskWorkTaskComponent } from './work-task/work-task.component';

const COMPONENTS = [
  WorkTaskWorkTaskComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    WorkTaskRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class WorkTaskModule { }
