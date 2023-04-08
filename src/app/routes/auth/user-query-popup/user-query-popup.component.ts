import { formatDate } from '@angular/common';
import { Component, EventEmitter, Inject, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
 
import { User } from '../models/user';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-auth-user-query-popup',
  templateUrl: './user-query-popup.component.html',
})
export class AuthUserQueryPopupComponent implements OnInit {
  scrollX = '100vw';

  
  @ViewChild('userTable', { static: false }) 
  private userTable!: STComponent;

  userTablecolumns: STColumn[] = [
    { title: '', index: 'id', type: 'radio', width: 70 },
    { title: this.i18n.fanyi('username'),  render: 'username' }, 
    { title: this.i18n.fanyi('firstname'),  render: 'firstname' }, 
    { title: this.i18n.fanyi('lastname'),  render: 'lastname' }, 
  ];
 
  // Form related data and functions
  queryModal!: NzModalRef;
  searchForm!: UntypedFormGroup;

  searching = false;
  queryInProcess = false;
  searchResult = '';


  // Table data for display
  listOfAllUsers: User[] = []; 
 
  @Output() readonly recordSelected: EventEmitter<any> = new EventEmitter();

  constructor(
    private fb: UntypedFormBuilder,
    private userService: UserService, 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService, 
  ) { 
   }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
 
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllUsers = []; 
  }

  search(): void {
    this.searching = true;
    this.userService
      .getUsers(
        this.searchForm.value.username,
        undefined,
        undefined,
        this.searchForm.value.firstname,
        this.searchForm.value.lastname,
      )
      .subscribe({
        next: (userRes) => {

          this.listOfAllUsers = userRes; 

          this.searching = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: userRes.length,
          });
        }, 
        error: () => {
          this.searching = false;
          this.searchResult = '';
        },
      });
  } 

  openQueryModal(
    tplQueryModalTitle: TemplateRef<{}>,
    tplQueryModalContent: TemplateRef<{}>,
    tplQueryModalFooter: TemplateRef<{}>,
  ): void {

    this.listOfAllUsers = []; 

    this.createQueryForm();

    // show the model
    this.queryModal = this.modalService.create({
      nzTitle: tplQueryModalTitle,
      nzContent: tplQueryModalContent,
      nzFooter: tplQueryModalFooter,

      nzWidth: 1000,
    });

  }
 
  createQueryForm(): void {
    // initiate the search form
    this.searchForm = this.fb.group({ 
      itemName: [null], 
      firstname: [null], 
      lastname: [null],
    });
 
  }
  closeQueryModal(): void {
    this.queryModal.destroy();
  }
  returnResult(): void {
    // get the selected record
    if (this.isAnyRecordChecked()) {
      this.recordSelected.emit(
        ''
      );
    } else {
      this.recordSelected.emit('');
    }
    this.queryModal.destroy();

  } 

  change(ret: STChange): void {
    console.log('change', ret);
  }
  isAnyRecordChecked() {
    return true;
  }
}
