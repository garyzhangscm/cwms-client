import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TransferItem } from 'ng-zorro-antd/transfer';
import { User } from '../models/user';
import { WorkingTeam } from '../models/working-team';
import { UserService } from '../services/user.service';
import { WorkingTeamService } from '../services/working-team.service';

@Component({
    selector: 'app-auth-working-team-user',
    templateUrl: './working-team-user.component.html',
    standalone: false
})
export class AuthWorkingTeamUserComponent implements OnInit {
  pageTitle: string;
  userList: TransferItem[] = [];
  assignedUserIds: number[] = [];
  currentWorkingTeam: WorkingTeam | undefined;
  allUsers: User[] = [];
  unassignedUserText: string;
  assignedUserText: string;
  processingUser = false;
  newWorkingTeam = false;
  previousPage = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private workingTeamService: WorkingTeamService,
    private userService: UserService,
    private message: NzMessageService,
    private router: Router,
  ) {
    this.pageTitle = this.i18n.fanyi('page.auth.working-team.users');
    this.unassignedUserText = this.i18n.fanyi('user.unassigned');
    this.assignedUserText = this.i18n.fanyi('user.assigned');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.auth.working-team.users'));

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.workingTeamId) {
        // Get the role and initiate the menu assignment
        this.workingTeamService.getWorkingTeam(params.workingTeamId).subscribe(workingTeamRes => {
          this.currentWorkingTeam = workingTeamRes;
          this.initUserAssignment();
          this.newWorkingTeam = false;
          this.previousPage = `/auth/working-team?name=${this.currentWorkingTeam.name}`;
        });
      }
      if (params.hasOwnProperty('new-working-team')) {
        this.newWorkingTeam = true;
        this.currentWorkingTeam = JSON.parse(sessionStorage.getItem('working-team-maintenance.working-team')!);
        this.initUserAssignment();
        this.previousPage = `/auth/working-team`;
      }
    });
  }

  initUserAssignment(): void {
    // Get all menus and accessible menus by role
    this.userService.getUsers().subscribe(userRes => {
      this.allUsers = userRes;
      this.userList = [];
      this.assignedUserIds = [];
      this.allUsers.forEach(user => {
        const userAssignedToWorkingTeam = this.newWorkingTeam
          ? this.currentWorkingTeam!.users.some(assignedUser => assignedUser.id === user.id)
          : user.workingTeams.some(workingTeam => workingTeam.id === this.currentWorkingTeam!.id)
            ? true
            : false;
        if (userAssignedToWorkingTeam) {
          this.assignedUserIds.push(user.id!);
        }

        this.userList.push({
          key: user.id!.toString(),
          title: `${user.firstname}, ${user.lastname}`,
          description: `${user.firstname}, ${user.lastname}`,
          direction: userAssignedToWorkingTeam ? 'right' : undefined,
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

  assignUser(): void {
    this.processingUser = true;
    const currentAssignedUserIds = this.userList.filter(item => item.direction === 'right').map(item => item.key);

    const newlyAssignedUserIds = currentAssignedUserIds.filter(
      id => !this.assignedUserIds.some(assignedUserId => assignedUserId === +id),
    );

    const newlyDeassignedUserIds = this.assignedUserIds.filter(
      assignedUserId => !currentAssignedUserIds.some(id => assignedUserId === +id),
    );

    this.workingTeamService
      .processUsers(this.currentWorkingTeam!.id, newlyAssignedUserIds, newlyDeassignedUserIds)
      .subscribe(res => {
        this.processingUser = false;
        this.message.success(this.i18n.fanyi('message.action.success'));
      });
  }

  goToNextPage(): void {
    const currentAssignedUserIds = this.userList.filter(item => item.direction === 'right').map(item => item.key);
    const assignedUser = this.allUsers.filter(user => currentAssignedUserIds.includes(user.id!.toString()));
    this.currentWorkingTeam!.users = assignedUser;
    sessionStorage.setItem('working-team-maintenance.working-team', JSON.stringify(this.currentWorkingTeam));
    const url = '/auth/working-team/maintenance/confirm?new-role';
    this.router.navigateByUrl(url);
  }

  onStepsIndexChange(index: number): void {
    switch (index) {
      case 0:
        this.router.navigateByUrl('/auth/working-team/maintenance?new-role');
        break;
      default:
        this.router.navigateByUrl('/auth/working-team/maintenance?new-role');
        break;
    }
  }
  return(): void {
    this.router.navigateByUrl(this.previousPage);
  }
}
