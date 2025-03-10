import { formatDate } from '@angular/common';
import { Component, inject, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { User } from '../models/user';
import { UserService } from '../services/user.service';

@Component({
    selector: 'app-auth-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.less'],
    standalone: false
})
export class AuthUserComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  displayOnly = false;
   
  private readonly fb = inject(FormBuilder);
  
  searchForm = this.fb.nonNullable.group({
    username: this.fb.control('', []), 
  });
  

  constructor( 
    private userService: UserService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private utilService: UtilService,
    private modalService: NzModalService,
    private messageService: NzMessageService,
  ) {
    userService.isCurrentPageDisplayOnly("/auth/user").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );      
    this.titleService.setTitle(this.i18n.fanyi('menu.main.auth.user'));
  }

  listOfColumns: Array<ColumnItem<User>> = [
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
      name: 'department',
      sortOrder: null,
      sortFn: (a: User, b: User) => this.utilService.compareNullableObjField(a, b, "department"),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'position',
      sortOrder: null,
      sortFn: (a: User, b: User) => this.utilService.compareNullableString(a.position, b.position),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'user.on-board-time',
      sortOrder: null,
      sortFn: (a: User, b: User) => this.utilService.compareNullableObjField(a, b, "onBoardTime"),
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
  
  newTempUserForm!: UntypedFormGroup;
  newTempUserModal!: NzModalRef;
  
  copyUserForm!: UntypedFormGroup;
  copyUserModal!: NzModalRef;

  
  resetForm(): void {
    this.searchForm!.reset();
    this.listOfAllUsers = [];
    this.listOfDisplayUsers = [];
  }

  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.userService.getUsers(this.searchForm.value.username ? this.searchForm.value.username : undefined)
    .subscribe(
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

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['username']) {
        this.searchForm.controls.username.setValue(params['username']);
        this.search();
      }
    });
  }

  
  openNewTempUserModal( 
    tplNewTempUserModalTitle: TemplateRef<{}>,
    tplNewTempUserModalContent: TemplateRef<{}>,
  ): void { 
    this.newTempUserForm = this.fb.group({
      username:  [null],
      firstname:  [null],
      lastname:  [null],
    });

    // Load the location
    this.newTempUserModal = this.modalService.create({
      nzTitle: tplNewTempUserModalTitle,
      nzContent: tplNewTempUserModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.newTempUserModal.destroy(); 
      },
      nzOnOk: () => {
        this.addNewTempUser( 
          this.newTempUserForm.value.username,
          this.newTempUserForm.value.firstname,
          this.newTempUserForm.value.lastname,
        );
        return false;
      },

      nzWidth: 1000,
    });
  }
  addNewTempUser(username: string, firstname: string, lastname: string) { 
    this.userService.addTempUser(username, firstname, lastname).subscribe({
      next: () => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.newTempUserModal.destroy(); 
        // search by the new user
        this.searchForm.controls.username.setValue(username);
        this.search();
      }, 
      error: () => this.messageService.error(this.i18n.fanyi('message.action.error'))
    })

  }

  
  openCopyUserModal(
    existingUser: User,
    tplCopyUserModalTitle: TemplateRef<{}>,
    tplCopyUserModalContent: TemplateRef<{}>,
  ): void { 
    this.copyUserForm = this.fb.group({
      copyFromUsername: new UntypedFormControl({ value: existingUser.username, disabled: true }),
      username:  [null],
      firstname:  [null],
      lastname:  [null],
    });

    // Load the location
    this.copyUserModal = this.modalService.create({
      nzTitle: tplCopyUserModalTitle,
      nzContent: tplCopyUserModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.copyUserModal.destroy(); 
      },
      nzOnOk: () => {
        this.copyUser( 
          existingUser.id!,
          this.copyUserForm.value.username,
          this.copyUserForm.value.firstname,
          this.copyUserForm.value.lastname,
        );
        return false;
      },

      nzWidth: 1000,
    });
  }
  copyUser(existingUserId: number, username: string, firstname: string, lastname: string) { 
    this.userService.copyUser(existingUserId, username, firstname, lastname).subscribe({
      next: () => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.copyUserModal.destroy(); 
        // search by the new user
        this.searchForm.controls.username.setValue(username);
        this.search();
      }, 
      error: () => this.messageService.error(this.i18n.fanyi('message.action.error'))
    })

  }
}
