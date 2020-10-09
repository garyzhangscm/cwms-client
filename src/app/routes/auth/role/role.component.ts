import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { FormGroup, FormBuilder } from '@angular/forms';
import { I18NService } from '@core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Role } from '../models/role';
import { RoleService } from '../services/role.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { MenuService } from '../services/menu.service';
import { MenuGroup } from '../models/menu-group';
import { formatDate } from '@angular/common';

interface ItemData {
  id: number;
  name: string;
  age: number;
  address: string;
}

@Component({
  selector: 'app-auth-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.less'],
})
export class AuthRoleComponent implements OnInit {
  searching = false;
  searchResult = '';

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private roleService: RoleService,
    private userService: UserService,
    private menuService: MenuService,
    private messageService: NzMessageService,
    private i18n: I18NService,
    private titleService: TitleService,
  ) {}

  // Form related data and functions
  searchForm: FormGroup;

  // Table data for display
  listOfAllRoles: Role[] = [];
  listOfDisplayRoles: Role[] = [];

  allMenus: MenuGroup[];

  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;
  // list of expanded row
  mapOfExpandedId: { [key: string]: boolean } = {};

  tabIndex = 0;

  resetForm(): void {
    this.searchForm.reset();
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
    this.roleService.getRoles(this.searchForm.controls.name.value).subscribe(
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
          if (this.mapOfExpandedId[role.id] === true) {
            this.loadUserAndMenu(this.mapOfExpandedId[role.id], role, tabIndex);
          }
        });
      },
      () => {
        this.searching = false;
        this.searchResult = '';
      },
    );
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayRoles = this.listOfAllRoles.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayRoles = this.listOfAllRoles;
    }
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.auth.role'));
    // initiate the search form
    this.searchForm = this.fb.group({
      name: [null],
    });
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.name) {
        this.searchForm.controls.name.setValue(params.name);
        this.search();
      }
    });
    this.loadAllMenus();
  }
  // Load all menus so when we expand the roles, we can display
  // the menu that assigned to the role
  loadAllMenus() {
    // Get all menus and accessible menus by role
    this.menuService.getMenus().subscribe(menuRes => {
      this.allMenus = menuRes;
    });
  }

  disableRole(roleId: number) {
    this.roleService.disableRole(roleId).subscribe(roleRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }
  enableRole(roleId: number) {
    this.roleService.enableRole(roleId).subscribe(roleRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }

  loadUserAndMenu(expanded: boolean, role: Role, tabIndex: number = 0) {
    this.mapOfExpandedId[role.id] = expanded;
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
          role.menus.forEach(assignedMenu => {
            if (assignedMenu.id === menu.id) {
              assignedMenu.menuGroup = this.i18n.fanyi(menuGroup.i18n);
              assignedMenu.menuSubGroup = this.i18n.fanyi(menuSubGroup.i18n);
              assignedMenu.overallSequence = menuGroup.sequence * 10000 + menuSubGroup.sequence * 100 + menu.sequence;
            }
          });
        });
      });
    });
    // Let's sort the menus based on the sequence of menu group / menu sub group / menu
    role.menus.sort((a, b) => a.overallSequence - b.overallSequence);
    this.tabIndex = tabIndex;
  }

  deassignUser(roleId: number, userId: number) {
    this.roleService.deassignUser(roleId, userId).subscribe(res => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search(0);
    });
  }
  deassignMenu(roleId: number, menuId: number) {
    this.roleService.deassignMenu(roleId, menuId).subscribe(res => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search(1);
    });
  }
}
