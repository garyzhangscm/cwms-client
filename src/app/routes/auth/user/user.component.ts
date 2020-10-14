import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { User } from '../models/user';
import { UserService } from '../services/user.service';
 
@Component({
  selector: 'app-auth-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.less'],
})
export class AuthUserComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private userService: UserService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private utilService: UtilService,
  ) {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.auth.user'));
  }

  listOfColumns: ColumnItem[] = [
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
    
  // Form related data and functions
  searchForm: FormGroup | undefined;

  // Table data for display
  listOfAllUsers: User[] = [];
  listOfDisplayUsers: User[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  pageTitle = '';

  searching = false;
  searchResult = '';

  resetForm(): void {
    this.searchForm!.reset();
    this.listOfAllUsers = [];
    this.listOfDisplayUsers = [];
  }

  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.userService.getUsers(this.searchForm!.controls.username.value).subscribe(
      userRes => {
        //      console.log(`user:\n${JSON.stringify(userRes)}`);
        this.listOfAllUsers = userRes;
        this.listOfDisplayUsers = userRes;

        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: userRes.length,
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
    
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.auth.user'));
    // initiate the search form
    this.searchForm = this.fb.group({
      username: [null],
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.username) {
        this.searchForm!.controls.username.setValue(params.username);
        this.search();
      }
    });
  }
}
