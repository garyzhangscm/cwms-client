import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { App, SettingsService } from '@delon/theme';
import { Company } from 'src/app/routes/warehouse-layout/models/company';
import { CompanyService } from 'src/app/routes/warehouse-layout/services/company.service';
import { WarehouseService } from 'src/app/routes/warehouse-layout/services/warehouse.service';

@Component({
  selector: 'layout-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  searchToggleStatus = false;
  currentWarehouse: string | undefined;
  currentCompany: Company | undefined;

  get app(): App {
    return this.settings.app;
  }

  get collapsed(): boolean {
    return this.settings.layout.collapsed;
  }
  constructor(
    public settings: SettingsService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private router: Router,
  ) {
    const warehouse = this.warehouseService.getCurrentWarehouse();
    const company = this.companyService.getCurrentCompany();
    if (company === null) {
      console.log(`Not able to get current company, will force the user to log in again`);
      router.navigateByUrl('passport/login');
    } else if (warehouse === null) {
      console.log(`Not able to get current warehouse, will force the user to log in again`);
      router.navigateByUrl('passport/login');
    } else {
      this.currentWarehouse = warehouse.name;
      this.currentCompany = company;
    }
  }

  toggleCollapsedSidebar(): void {
    this.settings.setLayout('collapsed', !this.settings.layout.collapsed);
  }

  searchToggleChange(): void {
    this.searchToggleStatus = !this.searchToggleStatus;
  }
}
