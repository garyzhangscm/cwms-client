import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TransferItem } from 'ng-zorro-antd/transfer';

import { Menu } from '../models/menu';
import { MenuGroup } from '../models/menu-group';
import { MenuSubGroup } from '../models/menu-sub-group';
import { MenuType } from '../models/menu-type.enum';
import { Role } from '../models/role';
import { MenuService } from '../services/menu.service';
import { RoleService } from '../services/role.service';

@Component({
  selector: 'app-auth-role-menu',
  templateUrl: './role-menu.component.html',
})
export class AuthRoleMenuComponent implements OnInit {
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

  constructor(
    private activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private fb: UntypedFormBuilder,
    private roleService: RoleService,
    private menuService: MenuService,
    private message: NzMessageService,
    private router: Router,
  ) {
    this.pageTitle = this.i18n.fanyi('page.auth.role.menus');
    this.unassignedMenuText = this.i18n.fanyi('menu.unassigned');
    this.assignedMenuText = this.i18n.fanyi('menu.assigned');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.auth.role.menus'));

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.roleId) {
        // Get the role and initiate the menu assignment
        this.roleService.getRole(params.roleId).subscribe(roleRes => {
          this.currentRole = roleRes;
          this.initMenuAssignment();
          this.newRole = false;
          this.previousPage = `/auth/role?name=${this.currentRole.name}`;
        });
      }
      if (params.hasOwnProperty('new-role')) {
        this.newRole = true;
        this.currentRole = JSON.parse(sessionStorage.getItem('role-maintenance.role')!);
        this.initMenuAssignment();
        this.previousPage = `/auth/role`;
      }
    });
  }

  initMenuAssignment(): void {
    // Get all menus and accessible menus by role
    this.menuService.getMenus().subscribe(menuRes => {
      this.allMenus = menuRes;
      this.accessibleMenuIds = [];
      // If we are not creating a new role, check which menus the existing
      // role has access to
      if (!this.newRole) {
        this.roleService.getAccessibleMenus(this.currentRole!.id).subscribe(accessibleMenus => {
          // console.log(`accessibleMenus: ${JSON.stringify(accessibleMenus)}`);
          // Save all the accessible menus id so that
          // we can show them in the right side of the transfer-able list control
          // all the un-accessible menus will be displayed in the left side
          accessibleMenus.forEach(menuGroup => {
            menuGroup.children.forEach(menuSubGroup => {
              menuSubGroup.children.forEach(menu => {
                this.accessibleMenuIds.push(menu.id);
              });
            });
          });
          this.loadMenuList();
        });
      } else {
        this.currentRole!.menuGroups.forEach(menuGroup => {
          menuGroup.children.forEach(menuSubGroup => {
            menuSubGroup.children.forEach(menu => {
              this.accessibleMenuIds.push(menu.id);
            });
          });
        });
        console.log(`this.accessibleMenuIds:${this.accessibleMenuIds}`);
        this.loadMenuList();
      }
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
    this.processingMenu = true;
    const currentAssignedMenuIds = [...this.webMenuList.filter(item => item.direction === 'right').map(item => item.key), 
       ...this.mobileMenuList.filter(item => item.direction === 'right').map(item => item.key)]; 
       
    const newlyAssignedMenuIds = currentAssignedMenuIds.filter(
      id => !this.accessibleMenuIds.some(accessibleMenuId => accessibleMenuId === +id),
    );

    const newlyDeassignedMenuIds = this.accessibleMenuIds.filter(
      accessibleMenuId => !currentAssignedMenuIds.some(id => accessibleMenuId === +id),
    );

    this.roleService.processMenus(this.currentRole!.id, newlyAssignedMenuIds, newlyDeassignedMenuIds).subscribe(
      {
        next: () => {
          
          this.processingMenu = false;
          this.message.success(this.i18n.fanyi('message.action.success'));
          
          setTimeout(() => {
            this.return();
          }, 500);
        }, 
        error: () =>  this.processingMenu = false
    });
  }

  goToNextPage(): void {
    const currentAssignedMenuIds = this.webMenuList.filter(item => item.direction === 'right').map(item => item.key);

    // Get the group and subgroup ids that we will need to
    // hold the actual menu items that assigned to the current role
    // we will need to create the structure of menu group / menu sub gruop / menu item
    // and assign to the role
    const currentAssignedMenuGroupIds = new Set();
    const currentAssignedMenuSubGroupIds = new Set();

    this.allMenus!.forEach(menuGroup => {
      menuGroup.children.forEach(menuSubGroup => {
        if (menuSubGroup.children.some(menu => currentAssignedMenuIds.includes(menu.id.toString()))) {
          currentAssignedMenuSubGroupIds.add(menuSubGroup.id);
          currentAssignedMenuGroupIds.add(menuGroup.id);
        }
      });
    });

    // loop through all the menu items and add it to the current role
    this.currentRole!.menuGroups = [];
    this.allMenus!.forEach(menuGroup => {
      // check if we will need to add the menu group
      if (!currentAssignedMenuGroupIds.has(menuGroup.id)) {
        return;
      }

      // will add the menu group to current role
      const currentMenuGroup: MenuGroup = {
        id: menuGroup.id,
        text: menuGroup.text,
        i18n: menuGroup.i18n,
        groupFlag: menuGroup.groupFlag,
        hideInBreadcrumb: menuGroup.hideInBreadcrumb,
        children: [],
        sequence: menuGroup.sequence,
        type: MenuType.WEB
      };

      // Loop through each sub group of this menu group and check
      // if we will need to add the sub group
      menuGroup.children.forEach(menuSubGroup => {
        // Skip this sub group
        if (!currentAssignedMenuSubGroupIds.has(menuSubGroup.id)) {
          return;
        }

        // will need to add the sub group
        const currentMenuSubGroup: MenuSubGroup = {
          id: menuSubGroup.id,
          text: menuSubGroup.text,
          i18n: menuSubGroup.i18n,
          icon: menuSubGroup.icon,
          shortcutRoot: menuSubGroup.shortcutRoot,

          children: [],
          sequence: menuSubGroup.sequence,
          link: menuSubGroup.link,
          badge: menuSubGroup.badge,
        };

        // loop through each menu item and add the item to
        // the sub group if it is assigned to the current role
        menuSubGroup.children.forEach(menu => {
          // current menu is not assigned
          if (!currentAssignedMenuIds.some(id => +id === menu.id)) {
            return;
          }

          const currentMenu: Menu = {
            id: menu.id,
            text: menu.text,
            i18n: menu.i18n,
            link: menu.link,
            sequence: menu.sequence,
          };
          // current item is assigned
          currentMenuSubGroup.children.push(currentMenu);
        });
        currentMenuGroup.children.push(currentMenuSubGroup);
      });
      this.currentRole!.menuGroups.push(currentMenuGroup);
    });
    sessionStorage.setItem('role-maintenance.role', JSON.stringify(this.currentRole));
    const url = '/auth/role-client?new-role';
    this.router.navigateByUrl(url);
  }

  onStepsIndexChange(index: number): void {
    switch (index) {
      case 0:
        this.router.navigateByUrl('/auth/role/maintenance?new-role');
        break;
      case 1:
        this.router.navigateByUrl('/auth/role-user?new-role');
        break;
      default:
        this.router.navigateByUrl('/auth/role/maintenance?new-role');
        break;
    }
  }
  return(): void {
    this.router.navigateByUrl(this.previousPage!);
  }
}
