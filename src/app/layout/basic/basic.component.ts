import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { I18nPipe, SettingsService, User } from '@delon/theme';
import { LayoutDefaultModule, LayoutDefaultOptions } from '@delon/theme/layout-default';
import { SettingDrawerModule } from '@delon/theme/setting-drawer';
import { ThemeBtnComponent } from '@delon/theme/theme-btn';
import { environment } from '@env/environment';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
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
import { CompanyService } from 'src/app/routes/warehouse-layout/services/company.service';
import { WarehouseService } from 'src/app/routes/warehouse-layout/services/warehouse.service';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'layout-basic',
  template: `
    <layout-default [options]="{logo: logoTpl }" [asideUser]="asideUserTpl" [content]="contentTpl" [customError]="null">
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
        @if (collapsed) {
          <h1 style="padding: 25px">
          <a href="./" target="_blank"  style="color: white;">{{ 
          currentCompany?.shortName ? 
             currentCompany?.shortName : 
             currentCompany?.name ?  currentCompany!.name.substring(0, 1) : "" }}
          </a></h1>  
        }
        @else {
          <h1 style="padding: 25px"  >
          <a href="./" target="_blank" style="color: white;">{{ currentCompany?.name}}</a></h1>  
        }
        
      </ng-template>
      <layout-default-header-item direction="left"  >
        <div  >
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
        <header-user />
      </layout-default-header-item>
      <ng-template #asideUserTpl>
        <div nz-dropdown nzTrigger="click" [nzDropdownMenu]="userMenu" class="alain-default__aside-user">
          <nz-avatar class="alain-default__aside-user-avatar" [nzSrc]="user.avatar" />
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
        <router-outlet />
      </ng-template>
    </layout-default>
    @if (showSettingDrawer) {
      <setting-drawer />
    }
    <theme-btn />
  `,
  imports: [
    RouterOutlet,
    RouterLink,
    I18nPipe,
    LayoutDefaultModule,
    SettingDrawerModule,
    ThemeBtnComponent,
    NzIconModule,
    NzMenuModule,
    NzDropDownModule,
    NzAvatarModule,
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
  private readonly settings = inject(SettingsService);
  collapsed = false;
  options: LayoutDefaultOptions = {
    logoExpanded: `./assets/logo-full.svg`, 
    logoCollapsed: `./assets/logo.svg`
  };
  searchToggleStatus = false;
  showSettingDrawer = !environment.production;
  
  currentWarehouse: string | undefined;
  currentWarehouseId: number | undefined;
  currentCompany: Company | undefined;
  warehouses!: Warehouse[];
  
  get user(): User {
    return this.settings.user;
  }
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
      this.warehouseService.getWarehouses().subscribe(warehouseRes => this.warehouses = warehouseRes)
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
        this.currentWarehouseId = warehouse.id;
        this.currentCompany = company;
      }
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
