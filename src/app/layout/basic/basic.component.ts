import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService, User } from '@delon/theme';
import { LayoutDefaultOptions } from '@delon/theme/layout-default';
import { environment } from '@env/environment';
import { Company } from 'src/app/routes/warehouse-layout/models/company';
import { CompanyService } from 'src/app/routes/warehouse-layout/services/company.service';
import { WarehouseService } from 'src/app/routes/warehouse-layout/services/warehouse.service';

@Component({
  selector: 'layout-basic',
  template: `
    <layout-default [options]="options" [asideUser]="asideUserTpl" [content]="contentTpl">
      
      <layout-default-header-item direction="left" hidden="pc">
        <div layout-default-header-item-trigger (click)="searchToggleStatus = !searchToggleStatus">
          <i nz-icon nzType="search"></i>
        </div>
      </layout-default-header-item>
      <layout-default-header-item direction="middle">
        <header-search class="alain-default__search" [(toggleChange)]="searchToggleStatus"></header-search>
      </layout-default-header-item>    
      <layout-default-header-item direction="right">
        <header-user></header-user>
      </layout-default-header-item>
      <ng-template #asideUserTpl>
        <div nz-dropdown nzTrigger="click" [nzDropdownMenu]="userMenu" class="alain-default__aside-user">
          <nz-avatar class="alain-default__aside-user-avatar" [nzSrc]="user.avatar"></nz-avatar>
          <div class="alain-default__aside-user-info">
            <strong>{{ user.name }}</strong>
            <p class="mb0">{{ user.email }}</p>
          </div>
        </div>
        <nz-dropdown-menu #userMenu="nzDropdownMenu">
          <ul nz-menu>
            <li nz-menu-item routerLink="/pro/account/center">{{ 'menu.account.center' | i18n }}</li>
            <li nz-menu-item routerLink="/pro/account/settings">{{ 'menu.account.settings' | i18n }}</li>
          </ul>
        </nz-dropdown-menu>
      </ng-template>
      <ng-template #contentTpl>
        <router-outlet></router-outlet>
      </ng-template>
    </layout-default>

    <setting-drawer *ngIf="showSettingDrawer"></setting-drawer>
    <theme-btn></theme-btn>
  `
})
export class LayoutBasicComponent {
  options: LayoutDefaultOptions = {
    logoExpanded: `./assets/logo-full.svg`,
    logoCollapsed: `./assets/logo.svg`
  };
  searchToggleStatus = false;
  showSettingDrawer = !environment.production;
  currentWarehouse: string | undefined;
  currentCompany: Company | undefined;
  get user(): User {
    return this.settings.user;
  }

  constructor(private settings: SettingsService,

    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private router: Router,) {

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
}
