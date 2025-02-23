import { Component } from '@angular/core';

import { ColorService } from '../color.service';

@Component({
    selector: 'app-typography',
    templateUrl: './typography.component.html',
    standalone: false
})
export class TypographyComponent {
  get names(): string[] {
    return this.colorSrv.names;
  }

  constructor(private colorSrv: ColorService) {}
}
