import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService, MenuService } from '@delon/theme';
import { TransferItem } from 'ng-zorro-antd/transfer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Role } from '../models/role';
import { MenuGroup } from '../models/menu-group';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { FormBuilder } from '@angular/forms';
import { RoleService } from '../services/role.service';
import { User } from '../models/user';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-auth-role-user',
  templateUrl: './role-user.component.html',
})
export class AuthRoleUserComponent implements OnInit {
  pageTitle: string;
  userList: TransferItem[] = [];
  assignedUserIds: number[] = [];
  currentRole: Role;
  allUsers: User[];
  unassignedUserText: string;
  assignedUserText: string;
  processingUser = false;
  newRole = false;
  previousPage: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private i18n: I18NService,
    private titleService: TitleService,
    private roleService: RoleService,
    private userService: UserService,
    private message: NzMessageService,
    private router: Router,
  ) {
    this.pageTitle = this.i18n.fanyi('page.auth.role.users');
    this.unassignedUserText = this.i18n.fanyi('user.unassigned');
    this.assignedUserText = this.i18n.fanyi('user.assigned');
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('page.auth.role.users'));

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.roleId) {
        // Get the role and initiate the menu assignment
        this.roleService.getRole(params.roleId).subscribe(roleRes => {
          this.currentRole = roleRes;
          this.initUserAssignment();
          this.newRole = false;
          this.previousPage = `/auth/role?name=${this.currentRole.name}`;
        });
      }
      if (params.hasOwnProperty('new-role')) {
        this.newRole = true;
        this.currentRole = JSON.parse(sessionStorage.getItem('role-maintenance.role'));
        this.initUserAssignment();
        this.previousPage = `/auth/role`;
      }
    });
  }

  initUserAssignment() {
    // Get all menus and accessible menus by role
    this.userService.getUsers().subscribe(userRes => {
      this.allUsers = userRes;
      this.userList = [];
      this.assignedUserIds = [];
      this.allUsers.forEach(user => {
        const userAssignedToRole = this.newRole
          ? this.currentRole.users.some(assignedUser => assignedUser.id === user.id)
          : user.roles.some(role => role.id === this.currentRole.id)
          ? true
          : false;
        if (userAssignedToRole) {
          this.assignedUserIds.push(user.id);
        }

        this.userList.push({
          key: user.id.toString(),
          title: `${user.firstname}, ${user.lastname}`,
          description: `${user.firstname}, ${user.lastname}`,
          direction: userAssignedToRole ? 'right' : undefined,
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

  assignUser() {
    this.processingUser = true;
    const currentAssignedUserIds = this.userList.filter(item => item.direction === 'right').map(item => item.key);

    const newlyAssignedUserIds = currentAssignedUserIds.filter(
      id => !this.assignedUserIds.some(assignedUserId => assignedUserId === +id),
    );

    const newlyDeassignedUserIds = this.assignedUserIds.filter(
      assignedUserId => !currentAssignedUserIds.some(id => assignedUserId === +id),
    );

    this.roleService.processUsers(this.currentRole.id, newlyAssignedUserIds, newlyDeassignedUserIds).subscribe(res => {
      this.processingUser = false;
      this.message.success(this.i18n.fanyi('message.action.success'));
    });
  }

  goToNextPage(): void {
    const currentAssignedUserIds = this.userList.filter(item => item.direction === 'right').map(item => item.key);
    const assignedUser = this.allUsers.filter(user => currentAssignedUserIds.includes(user.id.toString()));
    this.currentRole.users = assignedUser;
    sessionStorage.setItem('role-maintenance.role', JSON.stringify(this.currentRole));
    const url = '/auth/role-menu?new-role';
    this.router.navigateByUrl(url);
  }

  onStepsIndexChange(index: number) {
    switch (index) {
      case 0:
        this.router.navigateByUrl('/auth/role/maintenance?new-role');
        break;
      default:
        this.router.navigateByUrl('/auth/role/maintenance?new-role');
        break;
    }
  }
  return() {
    this.router.navigateByUrl(this.previousPage);
  }
}
