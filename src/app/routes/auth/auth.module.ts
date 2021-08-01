import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { AuthRoutingModule } from './auth-routing.module';

const COMPONENTS: Type<void>[] = [];

@NgModule({
  imports: [
    SharedModule,
    AuthRoutingModule
  ],
  declarations: COMPONENTS,
})
export class AuthModule { }
