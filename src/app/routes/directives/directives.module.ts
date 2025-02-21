import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import { AdminAccessDirective } from './adminAccess.directive';
import { AdminEnabledDirective } from './adminEnabled.directive';
import { AdminVisibleDirective } from './adminVisible.directive';
import { BarcodeDirective } from './barcode.directive';
import { DirectivesRoutingModule } from './directives-routing.module';
import { ExistingNumberValidator } from './existingNumberValidator';
import { FkeyDirective } from './fkey.directive';
import { NewNumberValidator } from './newNumberValidator';


const COMPONENTS: Array<Type<void>> = [];
const COMPONENTS_NOROUNT: Array<Type<void>> = [];

@NgModule({
    imports: [
        SharedModule,
        DirectivesRoutingModule
    ],
    declarations: [
        ...COMPONENTS,
        ...COMPONENTS_NOROUNT,
        FkeyDirective,
        BarcodeDirective,
        AdminVisibleDirective,
        AdminEnabledDirective,
        AdminAccessDirective,
        NewNumberValidator,
        ExistingNumberValidator
    ],
    exports: [FkeyDirective, BarcodeDirective, 
        NewNumberValidator,
        AdminAccessDirective, AdminEnabledDirective,
        AdminVisibleDirective, ExistingNumberValidator]
})
export class DirectivesModule { }
