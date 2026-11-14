import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { User } from '../models/user';
import { WorkingTeam } from '../models/working-team';
import { WorkingTeamService } from '../services/working-team.service';

@Component({
    selector: 'app-auth-working-team-maintenance-confirm',
    templateUrl: './working-team-maintenance-confirm.component.html',
    standalone: false
})
export class AuthWorkingTeamMaintenanceConfirmComponent implements OnInit {
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
      sortFn: (a: User, b: User) => a.email.localeCompare(b.email),
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

  currentWorkingTeam: WorkingTeam | undefined;
  pageTitle: string;

  constructor(
    private titleService: TitleService,
    private workingTeamService: WorkingTeamService,
    private router: Router,
    private messageService: NzMessageService,
    private utilService: UtilService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.working-team.confirm.title');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.working-team.confirm.title'));
    this.currentWorkingTeam = JSON.parse(sessionStorage.getItem('working-team-maintenance.working-team')!);
  }

  confirm(): void {
    this.workingTeamService.addWorkingTeam(this.currentWorkingTeam!).subscribe(workingTeamRes => {
      this.messageService.success(this.i18n.fanyi('message.new.complete'));
      setTimeout(() => this.goToNextPage(), 500);
    });
  }

  goToNextPage(): void {
    const url = `/auth/working-team?name=${this.currentWorkingTeam!.name}`;
    this.router.navigateByUrl(url);
  }

  onStepsIndexChange(index: number): void {
    switch (index) {
      case 0:
        this.router.navigateByUrl('/auth/working-team/maintenance?new-working-team');
        break;
      case 1:
        this.router.navigateByUrl('/auth/working-team-user?new-working-team');
        break;
      default:
        this.router.navigateByUrl('/auth/working-team/maintenance?new-role');
        break;
    }
  }
}
