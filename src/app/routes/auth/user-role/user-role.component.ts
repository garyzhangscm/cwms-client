import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN,  TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TransferItem } from 'ng-zorro-antd/transfer'; 
import { Role } from '../models/role';
import { User } from '../models/user';
import { RoleService } from '../services/role.service';
import { UserService } from '../services/user.service';

@Component({
    selector: 'app-auth-user-role',
    templateUrl: './user-role.component.html',
    standalone: false
})
export class AuthUserRoleComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  
  pageTitle: string;
  roleList: TransferItem[] = [];
  currentUser: User | undefined;
  accessibleRoleIds: number[] = [];
  allRoles: Role[] = [];
  unassignedRoleText: string;
  assignedRoleText: string;
  processingRole = false;
  newUser = false;
  previousPage = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private fb: UntypedFormBuilder,
    private roleService: RoleService,
    private userService: UserService,
    private message: NzMessageService,
    private router: Router,
  ) {
    this.pageTitle = this.i18n.fanyi('page.auth.user.roles');
    this.unassignedRoleText = this.i18n.fanyi('role.unassigned');
    this.assignedRoleText = this.i18n.fanyi('role.assigned');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.auth.user.roles'));

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.userId) {
        // Get the user and initiate the role assignment
        this.userService.getUser(params.userId).subscribe(userRes => {
          this.currentUser = userRes;
          this.initRoleAssignment();
          this.newUser = false;
          this.previousPage = `/auth/user?username=${this.currentUser.username}`;
        });
      }
      if (params.hasOwnProperty('new-user')) {
        this.newUser = true;
        this.currentUser = JSON.parse(sessionStorage.getItem('user-maintenance.user')!);
        this.initRoleAssignment();
        this.previousPage = `/auth/user`;
      }
    });
  }

  initRoleAssignment(): void {
    // Get all menus and accessible menus by role

    this.roleService.getRoles().subscribe(roleRes => {
      this.allRoles = roleRes;

      this.roleList = [];
      this.accessibleRoleIds = [];

      this.allRoles.forEach(role => {
        const userAssignedToRole = this.currentUser!.roles.some(assignedRole => assignedRole.id === role.id);
        if (userAssignedToRole) {
          this.accessibleRoleIds.push(role.id);
        }

        this.roleList.push({
          key: role.id.toString(),
          title: `${role.name}`,
          description: `${role.description}`,
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

  assignRole(): void {
    this.processingRole = true;
    const currentAssignedRoleIds = this.roleList.filter(item => item.direction === 'right').map(item => item.key);

    const newlyAssignedRoleIds = currentAssignedRoleIds.filter(
      id => !this.accessibleRoleIds.some(assignedRoleId => assignedRoleId === +id),
    );

    const newlyDeassignedRoleIds = this.accessibleRoleIds.filter(
      assignedRoleId => !currentAssignedRoleIds.some(id => assignedRoleId === +id),
    );

    this.userService.processRoles(this.currentUser!.id!, newlyAssignedRoleIds, newlyDeassignedRoleIds).subscribe(res => {
      this.processingRole = false;
      this.message.success(this.i18n.fanyi('message.action.success'));
    });
  }

  goToNextPage(): void {
    const currentAssignedRoleIds = this.roleList.filter(item => item.direction === 'right').map(item => item.key);
    const accessibleRoles = this.allRoles.filter(role => currentAssignedRoleIds.includes(role.id.toString()));
    this.currentUser!.roles = accessibleRoles;
    sessionStorage.setItem('user-maintenance.user', JSON.stringify(this.currentUser));
    const url = '/auth/user/maintenance/confirm?new-user';
    this.router.navigateByUrl(url);
  }

  onStepsIndexChange(index: number): void {
    switch (index) {
      case 0:
        this.router.navigateByUrl('/auth/user/maintenance?new-user');
        break;
      default:
        this.router.navigateByUrl('/auth/user/maintenance?new-user');
        break;
    }
  }

  return(): void {
    this.router.navigateByUrl(this.previousPage);
  }
}
