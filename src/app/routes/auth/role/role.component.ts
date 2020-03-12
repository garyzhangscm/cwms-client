import { Component, OnInit } from '@angular/core';
import { _HttpClient, User } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { I18NService } from '@core';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { ReceiptService } from '../../inbound/services/receipt.service';
import { UserService } from '../services/user.service';
import { SiteInformationService } from '../services/site-information.service';
import { Role } from '../models/role';
import { RoleService } from '../services/role.service';
import { ActivatedRoute } from '@angular/router';

interface ItemData {
  id: number;
  name: string;
  age: number;
  address: string;
}

@Component({
  selector: 'app-auth-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.less'],
})
export class AuthRoleComponent implements OnInit {
  searching = false;
  constructor(private fb: FormBuilder, private activatedRoute: ActivatedRoute, private roleSerivce: RoleService) {}

  // Form related data and functions
  searchForm: FormGroup;

  // Table data for display
  listOfAllRoles: Role[] = [];
  listOfDisplayRoles: Role[] = [];
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
    this.listOfAllRoles = [];
    this.listOfDisplayRoles = [];
  }

  search(): void {
    this.searching = true;
    this.roleSerivce.getRoles(this.searchForm.controls.name.value).subscribe(roleRes => {
      this.listOfAllRoles = roleRes;
      this.listOfDisplayRoles = roleRes;
      this.searching = false;
    });
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayRoles.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayRoles.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayRoles.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayRoles = this.listOfAllRoles.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayRoles = this.listOfAllRoles;
    }
  }

  ngOnInit() {
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

  removeRoles() {}
}
