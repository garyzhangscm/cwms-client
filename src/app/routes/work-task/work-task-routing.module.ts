import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/guard/auth.guard';
import { WorkTaskWorkTaskComponent } from './work-task/work-task.component';

const routes: Routes = [
  { path: 'work-task', component: WorkTaskWorkTaskComponent, canActivate: [AuthGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkTaskRoutingModule { }
