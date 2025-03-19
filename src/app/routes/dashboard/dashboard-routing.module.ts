import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'; 
 
import { DashboardWelcomeComponent } from './welcome/welcome.component'; 

const routes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' }, 
  { path: 'welcome', component: DashboardWelcomeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
