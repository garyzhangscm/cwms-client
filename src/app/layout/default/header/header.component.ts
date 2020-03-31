import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { SettingsService } from '@delon/theme';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { WarehouseService } from 'src/app/routes/warehouse-layout/services/warehouse.service';
import { Router } from '@angular/router';

@Component({
  selector: 'layout-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  searchToggleStatus: boolean;
  currentWarehouse: string;

  constructor(public settings: SettingsService, private warehouseService: WarehouseService, private router: Router) {
    const warehouse = this.warehouseService.getCurrentWarehouse();
    if (warehouse === null) {
      console.log(`Not able to get current warehouse, will force the user to log in again`);
      router.navigateByUrl('passport/login');
    } else {
      this.currentWarehouse = warehouse.name;
    }
  }

  toggleCollapsedSidebar() {
    this.settings.setLayout('collapsed', !this.settings.layout.collapsed);
  }

  searchToggleChange() {
    this.searchToggleStatus = !this.searchToggleStatus;
  }
}
