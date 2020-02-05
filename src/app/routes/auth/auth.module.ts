import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthUserComponent } from './user/user.component';
import { AuthRoleComponent } from './role/role.component';

const COMPONENTS = [
  AuthUserComponent,
  AuthRoleComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    AuthRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class AuthModule { }
