import { Component, OnInit } from '@angular/core';
import { _HttpClient, User } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { I18NService } from '@core';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { ReceiptService } from '../../inbound/services/receipt.service';
import { UserService } from '../services/user.service';
import { SiteInformationService } from '../services/site-information.service';

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
    private modalService: NzModalService,
    private receiptService: ReceiptService,
    private message: NzMessageService,
    private userService: UserService,
    private siteInformationService: SiteInformationService,
  ) {}

  // Form related data and functions
  searchForm: FormGroup;

  // Table data for display
  listOfAllUsers: User[] = [];
  listOfDisplayUsers: User[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  // checkbox - select all
  allChecked = false;
  indeterminate = false;
  isAllDisplayDataChecked = false;
  // list of checked checkbox
  mapOfCheckedId: { [key: string]: boolean } = {};

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllUsers = [];
    this.listOfDisplayUsers = [];
  }

  search(): void {
    this.userService.getUsers(this.searchForm.controls.username.value).subscribe(userRes => {
      console.log(`user:\n${JSON.stringify(userRes)}`);
      this.listOfAllUsers = userRes;
      this.listOfDisplayUsers = userRes;
    });

    this.siteInformationService
      .getSiteInformation(this.searchForm.controls.username.value)
      .subscribe(siteInformaiton => {
        console.log(`siteInformaiton:\n${JSON.stringify(siteInformaiton)}`);
      });
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayUsers.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayUsers.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayUsers.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
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
    // initiate the search form
    this.searchForm = this.fb.group({
      username: [null],
    });
  }

  removeUser() {}
}
