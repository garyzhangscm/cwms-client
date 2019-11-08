import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { UtilRoutingModule } from './util-routing.module';
import { UtilFileUploadComponent } from './file-upload/file-upload.component';

const COMPONENTS = [
  UtilFileUploadComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    UtilRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class UtilModule { }
