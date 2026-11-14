import { Component, inject, OnInit } from '@angular/core'; 
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TransferItem } from 'ng-zorro-antd/transfer';

import { MenuGroup } from '../../auth/models/menu-group'; 
import { MenuType } from '../../auth/models/menu-type.enum';
import { Role } from '../../auth/models/role';
import { MenuService } from '../../auth/services/menu.service'; 
import { Company } from '../../warehouse-layout/models/company';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { CompanyMenuService } from '../services/company-menu.service';

@Component({
    selector: 'app-util-company-menu',
    templateUrl: './company-menu.component.html',
    standalone: false
})
export class UtilCompanyMenuComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  pageTitle: string;
  webMenuList: TransferItem[] = [];
  mobileMenuList: TransferItem[] = [];
  currentRole: Role | undefined;
  accessibleMenuIds: number[] = [];
  allMenus: MenuGroup[] | undefined;
  unassignedMenuText: string;
  assignedMenuText: string;
  processingMenu = false;
  newRole = false;
  previousPage: string | undefined;
  selectedCompany?:Company;
  validCompanies: Company[] = [];
  isSpinning = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService, 
    private menuService: MenuService,
    private message: NzMessageService,
    private router: Router,
    private companyMenuService: CompanyMenuService,
    private companyService: CompanyService,
  ) {
    this.pageTitle = this.i18n.fanyi('company-menu');
    this.unassignedMenuText = this.i18n.fanyi('menu.unassigned');
    this.assignedMenuText = this.i18n.fanyi('menu.assigned');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('company-menu'));

    this.initMenuAssignment();
    this.companyService.getCompanies().subscribe({
      next: (companyRes) => {
        this.validCompanies = companyRes;
      }
    })

    
  }

  selectedCompanyChanged(companyCode: string) {

    this.selectedCompany = this.validCompanies.find(
      company => company.code === companyCode
    );
    if (this.selectedCompany) {
      // get the company's accessible menu
      this.companyMenuService.getCompanyMenus(this.selectedCompany.id).subscribe(assignedMenus => {
        // console.log(`accessibleMenus: ${JSON.stringify(accessibleMenus)}`);
        // Save all the accessible menus id so that
        // we can show them in the right side of the transfer-able list control
        // all the un-accessible menus will be displayed in the left side
        assignedMenus.forEach(companyMenu => this.accessibleMenuIds.push(companyMenu.menu.id));
        this.loadMenuList();
      });
    }
  }

  initMenuAssignment(): void {
    // Get all menus and accessible menus by role
    this.menuService.getMenus().subscribe(menuRes => {
      this.allMenus = menuRes;
      this.accessibleMenuIds = [];
      
      
    });
  }

  loadMenuList(): void {
    this.webMenuList = [];
    this.mobileMenuList = [];
    this.allMenus!.forEach(menuGroup => {
      menuGroup.children.forEach(menuSubGroup => {
        menuSubGroup.children.forEach(menu => {
          if (menuGroup.type === MenuType.MOBILE) {

            this.mobileMenuList.push({
              key: menu.id.toString(),
              title: `${this.i18n.fanyi(menuGroup.i18n)} / ${this.i18n.fanyi(menuSubGroup.i18n)} / ${this.i18n.fanyi(
                menu.i18n,
              )}`,
              description: `${this.i18n.fanyi(menuGroup.i18n)} / ${this.i18n.fanyi(
                menuSubGroup.i18n,
              )} / ${this.i18n.fanyi(menu.i18n)}`,
              direction: this.accessibleMenuIds.some(id => menu.id === id) ? 'right' : undefined,
            });
          }
          else {

            this.webMenuList.push({
              key: menu.id.toString(),
              title: `${this.i18n.fanyi(menuGroup.i18n)} / ${this.i18n.fanyi(menuSubGroup.i18n)} / ${this.i18n.fanyi(
                menu.i18n,
              )}`,
              description: `${this.i18n.fanyi(menuGroup.i18n)} / ${this.i18n.fanyi(
                menuSubGroup.i18n,
              )} / ${this.i18n.fanyi(menu.i18n)}`,
              direction: this.accessibleMenuIds.some(id => menu.id === id) ? 'right' : undefined,
            });
          }
        });
      });
    });
  }

  transferListFilterOption(inputValue: string, item: any): boolean {
    return item.title.indexOf(inputValue) > -1;
  }

  transferListSearch(ret: {}): void {
    console.log('nzSearchChange', ret);
  }

  transferListSelect(ret: {}): void {
    console.log('nzSelectChange', ret);
  }

  transferListChange(ret: {}): void {
    console.log('nzChange', ret);
  }

  assignMenu(): void {
    // Let's see if we assign / deassign some menu items

    // Get the final result from right side of the transfer control
    // Please note
    // menuList.item.key: String
    // this.accessibleMenuIds: arrays of number
    // when compare the 2 array, we may need to conver the string to number before the comparasion.
    this.isSpinning = true;
    const currentAssignedMenuIds = [...this.webMenuList.filter(item => item.direction === 'right').map(item => item['key']), 
       ...this.mobileMenuList.filter(item => item.direction === 'right').map(item => item['key'])]; 
       
    const newlyAssignedMenuIds = currentAssignedMenuIds.filter(
      id => !this.accessibleMenuIds.some(accessibleMenuId => accessibleMenuId === +id),
    );

    const newlyDeassignedMenuIds = this.accessibleMenuIds.filter(
      accessibleMenuId => !currentAssignedMenuIds.some(id => accessibleMenuId === +id),
    );

    this.companyMenuService.assignCompanyMenu(this.selectedCompany!.id, newlyAssignedMenuIds, newlyDeassignedMenuIds).subscribe(
      {
        next: () => {

          this.isSpinning = false;
          this.message.success(this.i18n.fanyi('message.action.success'));
        },
        error: () => this.isSpinning = false
      }
     );
  }

  
}
