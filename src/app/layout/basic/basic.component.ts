import { Component, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { StartupService } from '@core';
import { SettingsService, User, _HttpClient } from '@delon/theme';
import { LayoutDefaultOptions } from '@delon/theme/layout-default';
import { environment } from '@env/environment';
import { Company } from 'src/app/routes/warehouse-layout/models/company';
import { Warehouse } from 'src/app/routes/warehouse-layout/models/warehouse';
import { CompanyService } from 'src/app/routes/warehouse-layout/services/company.service';
import { WarehouseService } from 'src/app/routes/warehouse-layout/services/warehouse.service';

  // <layout-default [options]="options" [asideUser]="asideUserTpl" [content]="contentTpl">

@Component({
  selector: 'layout-basic', 
  template: `  
    <layout-default [options]="{logo: logoTpl }" [asideUser]="asideUserTpl" [content]="contentTpl">
      
      <layout-default-header-item direction="left"  >
        <div> 
          <nz-select [(ngModel)]="currentWarehouseId" (ngModelChange)="warehouseChanged()">
            <nz-option *ngFor="let warehouse of warehouses" [nzValue]="warehouse.id" [nzLabel]="warehouse.name"></nz-option> 
          </nz-select>
        </div>
      </layout-default-header-item>
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
      <layout-default-header-item direction="right">
        <!--

        <div>
          <a href="https://claytechs.gitbook.io/wms-user-manual/" target="_blank">
          <span nz-icon [nzType]="'question-circle'" [nzTheme]="'twotone'" [nzTwotoneColor]="'#52c41a'"></span>
          </a></div>

        -->
        <div>
          <a href="https://claytechs.gitbook.io/wms-user-manual/" target="_blank">
            <i nz-icon [nzType]="'question-circle'" style="font-size: 20px; color: #ffffff;" ></i> 
          </a>
        </div>
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
            <!--
            <li nz-menu-item routerLink="/pro/account/center">{{ 'menu.account.center' | i18n }}</li>
-->
            <li nz-menu-item routerLink="/pro/account/settings">{{ 'menu.account.settings' | i18n }}</li>
          </ul>
        </nz-dropdown-menu>
      </ng-template>
      <ng-template #contentTpl>
        <router-outlet></router-outlet>
      </ng-template>
      <ng-template #logoTpl>
        <h1 style="padding: 25px" *ngIf="!collapsed">
          <a href="./" target="_blank" style="color: white;">{{ currentCompany?.name}}</a></h1>  
        <h1 style="padding: 25px" *ngIf="collapsed">
          <a href="./" target="_blank"  style="color: white;">{{ 
          currentCompany?.shortName ? 
             currentCompany?.shortName : 
             currentCompany?.name ?  currentCompany!.name.substring(0, 1) : "" }}
          </a></h1>  
      </ng-template>
    </layout-default>

    <setting-drawer *ngIf="showSettingDrawer"></setting-drawer>
    <theme-btn></theme-btn>
  `
})
export class LayoutBasicComponent {

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

  constructor(private settings: SettingsService,
    private startupSrv: StartupService, 
    private warehouseService: WarehouseService,
    private companyService: CompanyService, 
    private router: Router,) {
      settings.notify.subscribe({
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
    console.log(`warehouse is changed to ${this.currentWarehouseId}`);
    
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
