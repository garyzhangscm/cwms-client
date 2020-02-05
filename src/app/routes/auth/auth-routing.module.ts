import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthUserComponent } from './user/user.component';
import { AuthRoleComponent } from './role/role.component';

const routes: Routes = [

  { path: 'user', component: AuthUserComponent },
  { path: 'role', component: AuthRoleComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
