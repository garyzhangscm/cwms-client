import { NgModule, Type } from '@angular/core';
import { XlsxModule } from '@delon/abc/xlsx';
import { SharedModule } from '@shared'; 

import { RouteRoutingModule } from './routes-routing.module';

const COMPONENTS: Array<Type<null>> = [];

@NgModule({
  imports: [SharedModule, RouteRoutingModule, XlsxModule ],
  declarations: [...COMPONENTS]
})
export class RoutesModule {}
