import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Role } from '../models/role';
import { WorkingTeam } from '../models/working-team';
import { UserService } from '../services/user.service';
import { WorkingTeamService } from '../services/working-team.service';

@Component({
  selector: 'app-auth-working-team',
  templateUrl: './working-team.component.html',
  styleUrls: ['./working-team.component.less'],
})
export class AuthWorkingTeamComponent implements OnInit {
  searching = false;
  searchResult = '';

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private workingTeamService: WorkingTeamService,
    private userService: UserService,
    private messageService: NzMessageService,
    private i18n: I18NService,
    private titleService: TitleService,
  ) {}

  // Form related data and functions
  searchForm: FormGroup | undefined;

  // Table data for display
  listOfAllWorkingTeams: WorkingTeam[] = [];
  listOfDisplayWorkingTeams: WorkingTeam[] = [];

  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;
  // list of expanded row
  mapOfExpandedId: { [key: string]: boolean } = {};

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
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: workingTeamRes.length,
        });
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
      if (this.mapOfExpandedId[workingTeam.id] === true) {
        this.showWorkingTeamDetails(this.mapOfExpandedId[workingTeam.id], workingTeam);
      }
    });
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.auth.working-team'));
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

  showWorkingTeamDetails(expanded: boolean, workingTeam: WorkingTeam): void {
    this.mapOfExpandedId[workingTeam.id] = expanded;

    this.userService.getUsers('', '', workingTeam.name).subscribe(userRes => {
      workingTeam.users = userRes;
    });
  }
}
