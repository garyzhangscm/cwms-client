import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { I18nPipe, SettingsService } from '@delon/theme';
import { LayoutDefaultModule, LayoutDefaultOptions } from '@delon/theme/layout-default';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { FormsModule } from '@angular/forms'; 

import { HeaderClearStorageComponent } from './widgets/clear-storage.component';
import { HeaderFullScreenComponent } from './widgets/fullscreen.component';
import { HeaderSearchComponent } from './widgets/search.component';
import { HeaderUserComponent } from './widgets/user.component';
import { HeaderI18nComponent } from './widgets/i18n.component';
import { Company } from 'src/app/routes/warehouse-layout/models/company';
import { Warehouse } from 'src/app/routes/warehouse-layout/models/warehouse';
import { StartupService } from '@core';
import { APP_NAME } from '../../core/app-brand';
import { MesThemeService } from '../../core/theme/mes-theme.service';
import { CompanyService } from 'src/app/routes/warehouse-layout/services/company.service';
import { WarehouseService } from 'src/app/routes/warehouse-layout/services/warehouse.service';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'layout-basic',
  template: `
    <layout-default class="mes-shell" nz-resizable [options]="{logo: logoTpl }" [asideUser]="null" [content]="contentTpl" [customError]="null">
      <!--
        <layout-default-header-item direction="left">
        <a layout-default-header-item-trigger href="//github.com/ng-alain/ng-alain" target="_blank">
          <nz-icon nzType="github" />
        </a>
      </layout-default-header-item>
-->
 <!--
      <layout-default-header-item direction="left" hidden="mobile">
        <a layout-default-header-item-trigger routerLink="/passport/lock">
          <nz-icon nzType="lock" />
        </a>
      </layout-default-header-item>
      
-->
      
      <ng-template #logoTpl>
        <a class="mes-brand" routerLink="/" [attr.aria-label]="appName">
          <img class="mes-brand__mark mes-brand__icon" src="./assets/claytech-one.png" [alt]="appName" />
          @if (!collapsed) {
            <span class="mes-brand__name">{{ appName }}</span>
          }
        </a>
      </ng-template>
      <layout-default-header-item direction="left"  >
        <div class="mes-warehouse">
          <span class="mes-warehouse__label">{{ 'warehouse' | i18n }}</span>
          <nz-select [(ngModel)]="currentWarehouseId" (ngModelChange)="warehouseChanged()">
            @for (warehouse of warehouses; track warehouse) {
              <nz-option   [nzValue]="warehouse.id" [nzLabel]="warehouse.name"></nz-option> 
            }   
          </nz-select>
        </div>
      </layout-default-header-item>
      <layout-default-header-item direction="left" hidden="pc">
        <div layout-default-header-item-trigger (click)="searchToggleStatus = !searchToggleStatus">
          <nz-icon nzType="search" />
        </div>
      </layout-default-header-item>
      <layout-default-header-item direction="middle">
        <header-search class="alain-default__search" [toggleChange]="searchToggleStatus" />
      </layout-default-header-item>
      <layout-default-header-item direction="right" hidden="mobile">
        <div layout-default-header-item-trigger nz-dropdown [nzDropdownMenu]="settingsMenu" nzTrigger="click" nzPlacement="bottomRight">
          <nz-icon nzType="setting" />
        </div>
        <nz-dropdown-menu #settingsMenu="nzDropdownMenu">
          <div nz-menu style="width: 200px;">
            <div nz-menu-item>
              <header-fullscreen />
            </div>
            <div nz-menu-item>
              <header-clear-storage />
            </div>
            <div nz-menu-item>
              <header-i18n />
            </div>
          </div>
        </nz-dropdown-menu>
      </layout-default-header-item>
      <layout-default-header-item direction="right">
        <button
          type="button"
          class="mes-theme-toggle"
          [attr.aria-pressed]="mesTheme.isDark"
          [attr.aria-label]="mesTheme.isDark ? 'Switch to white color theme' : 'Switch to dark color theme'"
          [title]="mesTheme.isDark ? 'Switch to white color theme' : 'Switch to dark color theme'"
          (click)="mesTheme.toggle()"
        >
          <nz-icon [nzType]="mesTheme.isDark ? 'bulb' : 'moon'" />
        </button>
      </layout-default-header-item>
      <layout-default-header-item direction="right">
        <header-user />
      </layout-default-header-item>
      <ng-template #contentTpl>
        <router-outlet />
      </ng-template>
    </layout-default>
  `,
  imports: [
    RouterOutlet,
    RouterLink,
    I18nPipe,
    LayoutDefaultModule,
    NzIconModule,
    NzMenuModule,
    NzDropDownModule,
    HeaderSearchComponent,
    HeaderClearStorageComponent,
    HeaderFullScreenComponent,
    HeaderUserComponent,
    HeaderI18nComponent,
    NzSelectModule,
    // NzFormModule,
    FormsModule, 
    // ReactiveFormsModule,
  ]
})
export class LayoutBasicComponent {
  readonly appName = APP_NAME;
  private readonly settings = inject(SettingsService);
  readonly mesTheme = inject(MesThemeService);
  collapsed = false;
  options: LayoutDefaultOptions = {
    logoExpanded: `./assets/logo-full.svg`, 
    logoCollapsed: `./assets/logo.svg`
  };
  searchToggleStatus = false;
  
  currentWarehouse: string | undefined;
  currentWarehouseId: number | undefined;
  currentCompany: Company | undefined;
  warehouses!: Warehouse[];
  
  constructor(
    private startupSrv: StartupService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private router: Router,) {

      this.settings.notify.subscribe({
        next: (value) => { 
            if (value.name == 'collapsed' && value.type == 'layout') {
              this.collapsed = value.value;
            }
        }
      });

      // load all the warehouses so that the user can choose between them
      const warehouse = this.warehouseService.getCurrentWarehouse();
      const company = this.companyService.getCurrentCompany(); 
      if (company == null) {
        console.log(`Not able to get current company, will force the user to log in again`);
        router.navigateByUrl('passport/login');
      } 
      else if (warehouse == null) {
        console.log(`Not able to get current warehouse, will force the user to log in again`);
        router.navigateByUrl('passport/login');
      }
      this.warehouseService.getWarehouses().subscribe(warehouseRes => this.warehouses = warehouseRes) 
      this.currentWarehouse = warehouse.name;
      this.currentWarehouseId = warehouse.id;
      this.currentCompany = company!; 
  }

  warehouseChanged() {
    // we will switch to other  
    
    this.warehouseService.getWarehouse(this.currentWarehouseId!).subscribe((warehouse: Warehouse) => {
      this.warehouseService.setCurrentWarehouse(warehouse);
      // 重新获取 StartupService 内容，我们始终认为应用信息一般都会受当前用户授权范围而影响
      this.startupSrv.load(warehouse.id).subscribe(() => {
        // refresh the current page
        window.location.reload();
      });
    });
 
  }

}
