import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { WorkingTeamService } from '../services/working-team.service';
import { UserService } from '../services/user.service';
import { NzMessageService } from 'ng-zorro-antd';
import { I18NService } from '@core';
import { WorkingTeam } from '../models/working-team';
import { Role } from '../models/role';

@Component({
  selector: 'app-auth-working-team',
  templateUrl: './working-team.component.html',
  styleUrls: ['./working-team.component.less'],
})
export class AuthWorkingTeamComponent implements OnInit {
  searching = false;
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
  searchForm: FormGroup;

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
    this.searchForm.reset();
    this.listOfAllWorkingTeams = [];
    this.listOfDisplayWorkingTeams = [];
  }

  // tab index: when we refresh from action of
  // deassign the user or menu, whether we will display
  // the user tab or menu tab
  // 0: display the user tab under the role record

  search(): void {
    this.searching = true;
    this.workingTeamService.getWorkingTeams(this.searchForm.controls.name.value).subscribe(workingTeamRes => {
      this.listOfAllWorkingTeams = workingTeamRes;
      this.listOfDisplayWorkingTeams = workingTeamRes;
      this.searching = false;
      this.loadDetails();
    });
  }
  loadDetails() {
    this.listOfAllWorkingTeams.forEach(workingTeam => {
      if (this.mapOfExpandedId[workingTeam.id] === true) {
        this.showWorkingTeamDetails(this.mapOfExpandedId[workingTeam.id], workingTeam);
      }
    });
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayWorkingTeams = this.listOfAllWorkingTeams.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayWorkingTeams = this.listOfAllWorkingTeams;
    }
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.auth.working-team'));
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
  }

  disableWorkingTeam(workingTeamId: number) {
    this.workingTeamService.disableWorkingTeam(workingTeamId).subscribe(workingTeamRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }
  enableWorkingTeam(workingTeamId: number) {
    this.workingTeamService.enableWorkingTeam(workingTeamId).subscribe(workingTeamRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }

  deassignUser(workingTeamId: number, userId: number) {
    this.workingTeamService.deassignUser(workingTeamId, userId).subscribe(res => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }

  showWorkingTeamDetails(expanded: boolean, workingTeam: WorkingTeam) {
    this.mapOfExpandedId[workingTeam.id] = expanded;

    this.userService.getUsers('', '', workingTeam.name).subscribe(userRes => {
      workingTeam.users = userRes;
    });
  }
}
