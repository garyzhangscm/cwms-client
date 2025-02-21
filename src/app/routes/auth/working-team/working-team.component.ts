import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { Role } from '../models/role';
import { User } from '../models/user';
import { WorkingTeam } from '../models/working-team';
import { UserService } from '../services/user.service';
import { WorkingTeamService } from '../services/working-team.service';

@Component({
    selector: 'app-auth-working-team',
    templateUrl: './working-team.component.html',
    styleUrls: ['./working-team.component.less'],
    standalone: false
})
export class AuthWorkingTeamComponent implements OnInit {
  listOfColumns: Array<ColumnItem<WorkingTeam>> = [
    {
      name: 'name',
      sortOrder: null,
      sortFn: (a: WorkingTeam, b: WorkingTeam) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'description',
      sortOrder: null,
      sortFn: (a: WorkingTeam, b: WorkingTeam) => a.description.localeCompare(b.description),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'enabled',
      sortOrder: null,
      sortFn: (a: WorkingTeam, b: WorkingTeam) => this.utilService.compareBoolean(a.enabled, b.enabled),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [
        { text: this.i18n.fanyi('true'), value: true },
        { text: this.i18n.fanyi('false'), value: false },
      ],
      filterFn: (list: boolean[], workingTeam: WorkingTeam) => list.some(enabled => workingTeam.enabled === enabled),
      showFilter: true
    },
  ];


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

  searching = false;
  searchResult = '';

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private activatedRoute: ActivatedRoute,
    private workingTeamService: WorkingTeamService,
    private userService: UserService,
    private messageService: NzMessageService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private utilService: UtilService, 
  ) { 
    userService.isCurrentPageDisplayOnly("/auth/working-team").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );       
  }

  // Form related data and functions
  searchForm!: UntypedFormGroup;

  // Table data for display
  listOfAllWorkingTeams: WorkingTeam[] = [];
  listOfDisplayWorkingTeams: WorkingTeam[] = [];

  expandSet = new Set<number>();

  tabIndex = 0;

  resetForm(): void {
    this.searchForm!.reset();
    this.listOfAllWorkingTeams = [];
    this.listOfDisplayWorkingTeams = [];
  }

  // tab index: when we refresh from action of
  // deassign the user or menu, whether we will display
  // the user tab or menu tab
  // 0: display the user tab under the role record

  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.workingTeamService.getWorkingTeams(this.searchForm!.controls.name.value).subscribe(
      workingTeamRes => {
        this.listOfAllWorkingTeams = workingTeamRes;
        this.listOfDisplayWorkingTeams = workingTeamRes;
        this.searching = false;
        /***
         * 
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: workingTeamRes.length,
        });
         * 
         */
        this.searchResult = this.i18n.fanyi('message.action.success');
        this.loadDetails();
      },
      () => {
        this.searching = false;
        this.searchResult = '';
      },
    );
  }
  loadDetails(): void {
    this.listOfAllWorkingTeams.forEach(workingTeam => {
      if (this.expandSet.has(workingTeam.id)) {
        this.showWorkingTeamDetails(workingTeam);
      }
    });
  }
  onExpandChange(workingTeam: WorkingTeam, checked: boolean): void {
    if (checked) {
      this.expandSet.add(workingTeam.id);
      this.showWorkingTeamDetails(workingTeam);
    } else {
      this.expandSet.delete(workingTeam.id);
    }
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.auth.working-team'));
    // initiate the search form
    this.searchForm = this.fb.group({
      name: [null],
    });
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['name']) {
        this.searchForm!.value.name.setValue(params['name']);
        this.search();
      }
    });
  }

  disableWorkingTeam(workingTeamId: number): void {
    this.workingTeamService.disableWorkingTeam(workingTeamId).subscribe(workingTeamRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }
  enableWorkingTeam(workingTeamId: number): void {
    this.workingTeamService.enableWorkingTeam(workingTeamId).subscribe(workingTeamRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }

  deassignUser(workingTeamId: number, userId: number): void {
    this.workingTeamService.deassignUser(workingTeamId, userId).subscribe(res => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }

  showWorkingTeamDetails(workingTeam: WorkingTeam): void {

    this.userService.getUsers('', '', workingTeam.name).subscribe(userRes => {
      workingTeam.users = userRes;
    });
  }
}
