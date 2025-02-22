import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN,  TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';


import { Client } from '../../common/models/client';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { Role } from '../models/role';
import { RoleMenu } from '../models/role-menu';
import { User } from '../models/user';
import { MenuService } from '../services/menu.service';
import { RoleService } from '../services/role.service';

interface MenuTreeNode {
  title: string;
  key: string;
  expanded?: boolean;
  children?: MenuTreeNode[];
  isLeaf?: boolean;
  displayOnly?: boolean;
}

@Component({
    selector: 'app-auth-role-maintenance-confirm',
    templateUrl: './role-maintenance-confirm.component.html',
    standalone: false
})
export class AuthRoleMaintenanceConfirmComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  listOfUserTableColumns: Array<ColumnItem<User>> = [
    {
      name: 'username',
      sortOrder: null,
      sortFn: (a: User, b: User) => a.username.localeCompare(b.username),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'firstname',
      sortOrder: null,
      sortFn: (a: User, b: User) => a.firstname.localeCompare(b.firstname),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'lastname',
      sortOrder: null,
      sortFn: (a: User, b: User) => a.lastname.localeCompare(b.lastname),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'email',
      sortOrder: null,
      sortFn: (a: User, b: User) => a.email!.localeCompare(b.email!),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'enabled',
      sortOrder: null,
      sortFn: (a: User, b: User) => this.utilService.compareBoolean(a.enabled, b.enabled),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [
        { text: this.i18n.fanyi('true'), value: true },
        { text: this.i18n.fanyi('false'), value: false },
      ],
      filterFn: (list: boolean[], user: User) => list.some(enabled => user.enabled === enabled),
      showFilter: true
    },
    {
      name: 'locked',
      sortOrder: null,
      sortFn: (a: User, b: User) => this.utilService.compareBoolean(a.locked, b.locked),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [
        { text: this.i18n.fanyi('true'), value: true },
        { text: this.i18n.fanyi('false'), value: false },
      ],
      filterFn: (list: boolean[], user: User) => list.some(locked => user.locked === locked),
      showFilter: true
    }
  ];

  listOfClientColumns: Array<ColumnItem<Client>> = [
    {
      name: 'name',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'description',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.description.localeCompare(b.description),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'contactor.firstname',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.contactorFirstname.localeCompare(b.contactorFirstname),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'contactor.lastname',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.contactorLastname.localeCompare(b.contactorLastname),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'country',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.addressCountry.localeCompare(b.addressCountry),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'state',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.addressState.localeCompare(b.addressState),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'county',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.addressCounty!.localeCompare(b.addressCounty!),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'city',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.addressCity.localeCompare(b.addressCity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'district',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.addressDistrict!.localeCompare(b.addressDistrict!),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'line1',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.addressLine1.localeCompare(b.addressLine1),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'line2',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.addressLine2!.localeCompare(b.addressLine2!),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'postcode',
      sortOrder: null,
      sortFn: (a: Client, b: Client) => a.addressPostcode.localeCompare(b.addressPostcode),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];

  currentRole!: Role;
  pageTitle: string;
  menuTree: MenuTreeNode[] = [];

  isSpinning = false;

  constructor(
    private titleService: TitleService,
    private roleService: RoleService,
    private router: Router,
    private messageService: NzMessageService,
    private utilService: UtilService,
    private menuService: MenuService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.role.confirm.title');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.role.confirm.title'));
    this.currentRole = JSON.parse(sessionStorage.getItem('role-maintenance.role')!);
    this.initMenuTree();
  }

  initMenuTree(): void {
    
    // Get all menus and accessible menus by role
    this.menuService.getMenus().subscribe({
      next: (menuRes) => {
        this.menuTree = [];
        menuRes.forEach(menuGroup => {
          const menuGroupTreeNode: MenuTreeNode = {
            title: this.i18n.fanyi(menuGroup.i18n),
            key: menuGroup.id.toString(),
            expanded: true,
            children: [],
          };
          // add child to it
          menuGroup.children.forEach(menuSubGroup => {
            const menuSubGroupTreeNode: MenuTreeNode = {
              title: this.i18n.fanyi(menuSubGroup.i18n),
              key: menuSubGroup.id.toString(),
              expanded: true,
              children: [],
            };
            // add child to it
            menuSubGroup.children.forEach(menu => {
              let roleMenu : RoleMenu | undefined
                  = this.currentRole.roleMenus.find(roleMenu =>  roleMenu.menu.id === menu.id);
              if (roleMenu != null) {
                // ok, the current menu is assigned to current role,
                // let's display it as a leaf node

                const menuTreeNode: MenuTreeNode  = {
                  title: this.i18n.fanyi(menu.i18n),
                  key: menu.id.toString(),
                  isLeaf: true,
                  displayOnly: roleMenu.displayOnlyFlag
                };
                // add the leaf to the node of menu subgruop node
                menuSubGroupTreeNode.children!.push(menuTreeNode); 
              }
            });

            if (menuSubGroupTreeNode.children!.length > 0) {
              // ok, the use has access to some menu under this sub group
              // let's add the sub group to the menu group
              menuGroupTreeNode.children!.push(menuSubGroupTreeNode);
            }
          });
          if (menuGroupTreeNode.children!.length > 0) {
              // ok, the use has access to some menu sub group under this group
              // let's add the group to the tree
            this.menuTree!.push(menuGroupTreeNode);
          }
        });
      }

    });
  }
  confirm(): void {
    this.isSpinning = true;
    this.roleService.addRole(this.currentRole!).subscribe({
      next: () => {
        
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        setTimeout(() => {
          this.isSpinning = false;
          this.goToNextPage();
        }, 500);
      }, 
      error: () => this.isSpinning = false
    });
  }

  goToNextPage(): void {
    const url = `/auth/role?name=${this.currentRole!.name}`;
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
      case 2:
        this.router.navigateByUrl('/auth/role-menu?new-role');
        break;
      case 3:
        this.router.navigateByUrl('/auth/role-client?new-role');
        break;
      default:
        this.router.navigateByUrl('/auth/role/maintenance?new-role');
        break;
    }
  }
}
