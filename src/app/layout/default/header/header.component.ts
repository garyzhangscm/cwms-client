import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { SettingsService } from '@delon/theme';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Component({
  selector: 'layout-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  searchToggleStatus: boolean;
  currentWarehouse: string;

  constructor(public settings: SettingsService, @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    console.log(JSON.stringify(this.tokenService.get()));
    this.currentWarehouse = this.tokenService.get().currentWarehouse.name;
  }

  toggleCollapsedSidebar() {
    this.settings.setLayout('collapsed', !this.settings.layout.collapsed);
  }

  searchToggleChange() {
    this.searchToggleStatus = !this.searchToggleStatus;
  }
}
