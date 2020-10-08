import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkTaskWorkTaskComponent } from './work-task/work-task.component';

const routes: Routes = [

  { path: 'work-task', component: WorkTaskWorkTaskComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkTaskRoutingModule { }
