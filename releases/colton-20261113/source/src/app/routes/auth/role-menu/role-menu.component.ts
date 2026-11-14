import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TransferItem } from 'ng-zorro-antd/transfer';
 
import { MenuGroup } from '../models/menu-group'; 
import { MenuType } from '../models/menu-type.enum';
import { Role } from '../models/role';
import { MenuService } from '../services/menu.service';
import { RoleService } from '../services/role.service';

@Component({
    selector: 'app-auth-role-menu',
    templateUrl: './role-menu.component.html',
    standalone: false
})
export class AuthRoleMenuComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  pageTitle: string;
  webMenuList: TransferItem[] = [];
  mobileMenuList: TransferItem[] = [];
  currentRole: Role | undefined;
  fullyAccessibleMenuIds: number[] = [];
  displayOnlyAccessibleMenuIds: number[] = [];
  allMenus: MenuGroup[] | undefined;
  unassignedMenuText: string;
  assignedMenuText: string;
  processingMenu = false;
  newRole = false;
  previousPage: string | undefined;

  constructor(
    private activatedRoute: ActivatedRoute,
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
      if (params['roleId']) {
        // Get the role and initiate the menu assignment
        this.roleService.getRole(params['roleId']).subscribe(roleRes => {
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
      this.fullyAccessibleMenuIds = [];
      this.displayOnlyAccessibleMenuIds = []; 
  
      this.currentRole!.roleMenus.forEach(
          roleMenu => {
            if (roleMenu.displayOnlyFlag) {
              this.displayOnlyAccessibleMenuIds.push(roleMenu.menu.id);
            }
            else {              
              this.fullyAccessibleMenuIds.push(roleMenu.menu.id);
            }
          }
      );
      this.loadMenuList();
  
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
              direction: this.fullyAccessibleMenuIds.some(id => menu.id === id) ||
                          this.displayOnlyAccessibleMenuIds.some(id => menu.id === id) ? 'right' : undefined,
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
              direction:  this.fullyAccessibleMenuIds.some(id => menu.id === id) ||
                             this.displayOnlyAccessibleMenuIds.some(id => menu.id === id) ? 'right' : undefined,
              displayOnly: this.displayOnlyAccessibleMenuIds.some(id => menu.id === id)
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
    const currentAssignedMenuIds = [...this.webMenuList.filter(item => item.direction === 'right').map(item => item['key']), 
       ...this.mobileMenuList.filter(item => item.direction === 'right').map(item => item['key'])]; 

       
   //  const newlyAssignedFullyFunctionalMenuIds = currentAssignedMenuIds.filter(
   //    id => !this.accessibleMenuIds.some(accessibleMenuId => accessibleMenuId === +id) 
   //  );
   const newlyAssignedFullyFunctionalWebMenuIds = 
      [...this.webMenuList.filter(item => item.direction === 'right' && !item['displayOnly']).map(item => item['key'])]; 
   
    //  const newlyAssignedDisplayOnlyMenuIds = currentAssignedMenuIds.filter(
    //    id => !this.accessibleMenuIds.some(accessibleMenuId => accessibleMenuId === +id),
    //  );
   const newlyAssignedDisplayOnlyWebMenuIds = 
       [...this.webMenuList.filter(item => item.direction === 'right' && item['displayOnly']).map(item => item['key'])]; 

    const newlyDeassignedMenuIds = 
    [...this.fullyAccessibleMenuIds.filter(
      accessibleMenuId => !currentAssignedMenuIds.some(id => accessibleMenuId === +id),
      ),
      ...this.displayOnlyAccessibleMenuIds.filter(
        accessibleMenuId => !currentAssignedMenuIds.some(id => accessibleMenuId === +id),
      ), 
    ];

    console.log(`start to assign menu with`);
    console.log(`========    newlyAssignedFullyFunctionalWebMenuIds   ========== `);
    console.log(`${JSON.stringify(newlyAssignedFullyFunctionalWebMenuIds)}`);
    console.log(`========    newlyAssignedDisplayOnlyWebMenuIds   ========== `);
    console.log(`${JSON.stringify(newlyAssignedDisplayOnlyWebMenuIds)}`);  
    this.roleService.processMenus(this.currentRole!.id, newlyAssignedFullyFunctionalWebMenuIds, 
      newlyAssignedDisplayOnlyWebMenuIds, newlyDeassignedMenuIds).subscribe(
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

  /***
   * 
   * Moved from the role.menu structure into role.roleMenus as we are now allow a new 
   * 'display' flag on the web menu / web page
   * 
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
            name: menu.name
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
   * 
   */
  /**
   * Assign the menu to the new role
   */
  goToNextPage(): void {
    
    const currentAssignedMobileMenuIds = [
       ...this.mobileMenuList.filter(item => item.direction === 'right').map(item => item['key'])]; 
 
    const newlyAssignedFullyFunctionalWebMenuIds = 
        [...this.webMenuList.filter(item => item.direction === 'right' && !item['displayOnly']).map(item => item['key'])]; 
    
      //  const newlyAssignedDisplayOnlyMenuIds = currentAssignedMenuIds.filter(
      //    id => !this.accessibleMenuIds.some(accessibleMenuId => accessibleMenuId === +id),
      //  );
    const newlyAssignedDisplayOnlyWebMenuIds = 
        [...this.webMenuList.filter(item => item.direction === 'right' && item['displayOnly']).map(item => item['key'])];

    this.currentRole!.roleMenus = [];
    this.allMenus!.forEach(menuGroup => {       
      // Loop through each sub group of this menu group and check
      // if we will need to add the sub group
      menuGroup.children.forEach(menuSubGroup => {
        // loop through each menu item and add the item to
        // the sub group if it is assigned to the current role
        menuSubGroup.children.forEach(menu => {
          // for mobile menus, we will always disable display only flag
          if (currentAssignedMobileMenuIds.some(id => +id === menu.id) ||
            newlyAssignedFullyFunctionalWebMenuIds.some(id => +id === menu.id) 
            ) {
              this.currentRole!.roleMenus = [...this.currentRole!.roleMenus, 
                {
                  menu: menu,
                  displayOnlyFlag: false,
                }
              ];
          }
          else if (newlyAssignedDisplayOnlyWebMenuIds.some(id => +id === menu.id)) {
            
            this.currentRole!.roleMenus = [...this.currentRole!.roleMenus, 
              {
                menu: menu,
                displayOnlyFlag: true,
              }
            ];
          }
        });
      });
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
