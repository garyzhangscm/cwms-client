import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { Role } from '../models/role';
import { User } from '../models/user';
import { RoleService } from '../services/role.service';

interface MenuTreeNode {
  title: string;
  key: string;
  expanded?: boolean;
  children?: MenuTreeNode[];
  isLeaf?: boolean;
}

@Component({
  selector: 'app-auth-role-maintenance-confirm',
  templateUrl: './role-maintenance-confirm.component.html',
})
export class AuthRoleMaintenanceConfirmComponent implements OnInit {
  listOfUserTableColumns: ColumnItem[] = [
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

  currentRole!: Role;
  pageTitle: string;
  menuTree: MenuTreeNode[] = [];

  constructor(
    private i18n: I18NService,
    private titleService: TitleService,
    private roleService: RoleService,
    private router: Router,
    private messageService: NzMessageService,
    private utilService: UtilService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.role.confirm.title');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.role.confirm.title'));
    this.currentRole = JSON.parse(sessionStorage.getItem('role-maintenance.role')!);
    this.initMenuTree();
  }

  initMenuTree(): void {
    this.menuTree = []; 
    this.currentRole!.menuGroups.forEach(menuGroup => {
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
          const menuTreeNode: MenuTreeNode = {
            title: this.i18n.fanyi(menu.i18n),
            key: menu.id.toString(),
            isLeaf: true,
          };
          menuSubGroupTreeNode.children!.push(menuTreeNode);
        });
        menuGroupTreeNode.children!.push(menuSubGroupTreeNode);
      });
      this.menuTree!.push(menuGroupTreeNode);
    });
  }
  confirm(): void {
    this.roleService.addRole(this.currentRole!).subscribe(roleRes => {
      this.messageService.success(this.i18n.fanyi('message.new.complete'));
      setTimeout(() => this.goToNextPage(), 2000);
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
      default:
        this.router.navigateByUrl('/auth/role/maintenance?new-role');
        break;
    }
  }
}
