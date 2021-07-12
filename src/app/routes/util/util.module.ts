import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { UtilFileUploadComponent } from './file-upload/file-upload.component';
import { UtilIconListComponent } from './icon-list/icon-list.component'; 
import { UtilTestDataInitComponent } from './test-data-init/test-data-init.component';
import { UtilTesterComponent } from './tester/tester.component';
import { UtilRoutingModule } from './util-routing.module';
import { UtilSystemConfigurationComponent } from './system-configuration/system-configuration.component';

const COMPONENTS: Type<void>[] = [
  UtilFileUploadComponent,  
  UtilTestDataInitComponent,
  UtilIconListComponent,
  UtilTesterComponent,
  UtilSystemConfigurationComponent];

  

const COMPONENTS_NOROUNT: Type<void>[] = [];

@NgModule({
  imports: [
    SharedModule,
    UtilRoutingModule,    
    NzDescriptionsModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  exports: [],

})
export class UtilModule { }
