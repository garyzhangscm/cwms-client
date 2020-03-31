import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { I18NService } from '@core';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { UserService } from '../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '../models/user';

interface ItemData {
  id: number;
  name: string;
  age: number;
  address: string;
}

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
  ) {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.auth.user'));
  }

  // Form related data and functions
  searchForm: FormGroup;

  // Table data for display
  listOfAllUsers: User[] = [];
  listOfDisplayUsers: User[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  pageTitle: string;

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllUsers = [];
    this.listOfDisplayUsers = [];
  }

  search(): void {
    this.userService.getUsers(this.searchForm.controls.username.value).subscribe(userRes => {
      //      console.log(`user:\n${JSON.stringify(userRes)}`);
      this.listOfAllUsers = userRes;
      this.listOfDisplayUsers = userRes;
    });
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayUsers = this.listOfAllUsers.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayUsers = this.listOfAllUsers;
    }
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.auth.user'));
    // initiate the search form
    this.searchForm = this.fb.group({
      username: [null],
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.username) {
        this.searchForm.controls.username.setValue(params.username);
        this.search();
      }
    });
  }
}
