import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message'; 

import { Client } from '../../common/models/client';
import { ColumnItem } from '../../util/models/column-item';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { UtilService } from '../../util/services/util.service';
import { Menu } from '../models/menu';
import { MenuGroup } from '../models/menu-group';
import { Role } from '../models/role';
import { RoleMenu } from '../models/role-menu';
import { User } from '../models/user';
import { MenuService } from '../services/menu.service';
import { RoleService } from '../services/role.service';
import { UserService } from '../services/user.service';
 

@Component({
  selector: 'app-auth-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.less'],
})
export class AuthRoleComponent implements OnInit {
  listOfColumns: Array<ColumnItem<Role>> = [
    {
      name: 'name',
      sortOrder: null,
      sortFn: (a: Role, b: Role )  =>  a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'description',
      sortOrder: null,
      sortFn: (a: Role, b: Role) => a.description.localeCompare(b.description),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'enabled',
      sortOrder: null,
      sortFn: (a: Role, b: Role) => this.utilService.compareBoolean(a.enabled, b.enabled),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];
  listOfSubTableColumns: Array<ColumnItem<User>> = [
    {
      name: 'username',
      sortOrder: null,
      sortFn: (a: User, b: User) => a.username.localeCompare(b.username),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'firstname',
      sortOrder: null,
      sortFn: (a: User, b: User) => a.firstname.localeCompare(b.firstname),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'lastname',
      sortOrder: null,
      sortFn: (a: User, b: User) => a.lastname.localeCompare(b.lastname),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'email',
      sortOrder: null,
      sortFn: (a: User, b: User) => a.email.localeCompare(b.email),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'enabled',
      sortOrder: null,
      sortFn: (a: User, b: User) => this.utilService.compareBoolean(a.enabled, b.enabled),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'locked',
      sortOrder: null,
      sortFn: (a: User, b: User) => this.utilService.compareBoolean(a.locked, b.locked),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];


  listOfMenuTableColumns: Array<ColumnItem<RoleMenu>> = [
    {
      name: 'menuGroup',
      sortOrder: null,
      sortFn: (a: RoleMenu, b: RoleMenu) => a.menu.menuGroup!.localeCompare(b.menu.menuGroup!),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'menuSubGroup',
      sortOrder: null,
      sortFn: (a: RoleMenu, b: RoleMenu) => a.menu.menuSubGroup!.localeCompare(b.menu.menuSubGroup!),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'name',
      sortOrder: null,
      sortFn: (a: RoleMenu, b: RoleMenu) => a.menu.i18n!.localeCompare(b.menu.i18n!),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'sequence',
      sortOrder: null,
      sortFn: (a: RoleMenu, b: RoleMenu) => a.menu.sequence - b.menu.sequence,
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'menu.i18n',
      sortOrder: null,
      sortFn: (a: RoleMenu, b: RoleMenu) => a.menu.i18n!.localeCompare(b.menu.i18n!),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'link',
      sortOrder: null,
      sortFn: (a: RoleMenu, b: RoleMenu) => a.menu.link!.localeCompare(b.menu.link!),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'displayOnly',
      sortOrder: null,
      sortFn: (a: RoleMenu, b: RoleMenu) => this.utilService.compareBoolean(a.displayOnlyFlag, b.displayOnlyFlag),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
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
  searching = false;
  searchResult = '';


  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private activatedRoute: ActivatedRoute,
    private roleService: RoleService,
    private userService: UserService,
    private menuService: MenuService,
    private messageService: NzMessageService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private utilService: UtilService,
    private localCacheService: LocalCacheService, 
  ) {
    userService.isCurrentPageDisplayOnly("/auth/role").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );     
   }

  // Form related data and functions
  searchForm!: UntypedFormGroup;

  // Table data for display
  listOfAllRoles: Role[] = [];
  listOfDisplayRoles: Role[] = [];

  allMenus: MenuGroup[] = [];

  expandSet = new Set<number>();

  tabIndex = 0;

  resetForm(): void {
    this.searchForm!.reset();
    this.listOfAllRoles = [];
    this.listOfDisplayRoles = [];
  }

  // tab index: when we refresh from action of
  // deassign the user or menu, whether we will display
  // the user tab or menu tab
  // 0: display the user tab under the role record
  // 1: display the menu tab under the role record
  search(tabIndex: number = 0): void {
    this.searching = true;
    this.searchResult = '';
    this.roleService.getRoles(this.searchForm!.controls.name.value).subscribe(
      roleRes => {
        this.listOfAllRoles = roleRes;
        this.listOfDisplayRoles = roleRes;

        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: roleRes.length,
        });

        // check if we have any role with details expanded. If we find those roles, let's
        // refresh the content as well
        this.listOfAllRoles.forEach(role => {
          if (this.expandSet.has(role.id)) {
            this.loadUserAndMenuAndClient(this.expandSet.has(role.id), role, tabIndex);
          }
        });
      },
      () => {
        this.searching = false;
        this.searchResult = '';
      },
    );
  }


  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.auth.role'));
    // initiate the search form
    this.searchForm = this.fb.group({
      name: [null],
    });
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.name) {
        this.searchForm!.controls.name.setValue(params.name);
        this.search();
      }
    });
    this.loadAllMenus();
  }
  // Load all menus so when we expand the roles, we can display
  // the menu that assigned to the role
  loadAllMenus(): void {
    // Get all menus and accessible menus by role
    this.menuService.getMenus().subscribe(menuRes => {
      this.allMenus = menuRes;
    });
  }

  disableRole(roleId: number): void {
    this.roleService.disableRole(roleId).subscribe(roleRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }
  enableRole(roleId: number): void {
    this.roleService.enableRole(roleId).subscribe(roleRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }

  loadUserAndMenuAndClient(expanded: boolean, role: Role, tabIndex: number = 0): void {
    if (expanded) {
      this.expandSet.add(role.id);
    } else {
      this.expandSet.delete(role.id);
    }

    // By default when we get role from the service, it will contains the menu informaiton
    // but not the user infomation, when we expand the role to see the menu and users,
    // we will need to load the users for the specific role
    this.userService.getUsers('', role.name).subscribe(userRes => {
      role.users = userRes;
    });
    // role.menus only stored the menus without the menugroup and sub group information
    // Let's fix this so we can display the information about this 2

    this.allMenus.forEach(menuGroup => {
      menuGroup.children.forEach(menuSubGroup => {
        menuSubGroup.children.forEach(menu => {
          role.roleMenus.forEach(assignedMenu => {
            if (assignedMenu.menu.id === menu.id) {
              assignedMenu.menu.menuGroup = this.i18n.fanyi(menuGroup.i18n);
              assignedMenu.menu.menuSubGroup = this.i18n.fanyi(menuSubGroup.i18n);
              assignedMenu.menu.overallSequence = menuGroup.sequence * 10000 + menuSubGroup.sequence * 100 + menu.sequence;
            }
          });
        });
      });
    });
    // Let's sort the menus based on the sequence of menu group / menu sub group / menu
    role.roleMenus.sort((a, b) => a.menu.overallSequence! - b.menu.overallSequence!);
    this.tabIndex = tabIndex;

    // load the client information
    role.clientAccesses.forEach(
      roleClientAccess => {
        if (roleClientAccess.client == null) {

          this.localCacheService.getClient(roleClientAccess.clientId).subscribe(
            client => roleClientAccess.client = client
          )
        }
      }
    )
  }

  deassignUser(roleId: number, userId: number): void {
    this.roleService.deassignUser(roleId, userId).subscribe(res => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search(0);
    });
  }
  deassignMenu(roleId: number, menuId: number): void {
    this.roleService.deassignMenu(roleId, menuId).subscribe(res => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search(1);
    });
  }
  onExpandChange(role: Role, checked: boolean): void {
    if (checked) {
      this.expandSet.add(role.id);
      this.loadUserAndMenuAndClient(true, role);
    } else {
      this.expandSet.delete(role.id);
    }


  }
}
