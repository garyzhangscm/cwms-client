import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, User, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';

import { Role } from '../../auth/models/role';
import { RoleService } from '../../auth/services/role.service';
import { UserService } from '../../auth/services/user.service';
import { WorkTask } from '../models/work-task';
import { WorkTaskStatus } from '../models/work-task-status.enum';
import { WorkTaskType } from '../models/work-task-type.enum';
import { WorkTaskService } from '../services/work-task.service';

@Component({
    selector: 'app-work-task-work-task',
    templateUrl: './work-task.component.html',
    styleUrls: ['./work-task.component.less'],
    standalone: false
})
export class WorkTaskWorkTaskComponent implements OnInit {

  searchForm!: UntypedFormGroup;
  searchResult = '';
  workTasks: WorkTask[] = [];

  isSpinning = false;
  workTaskTypes = WorkTaskType;
  workTaskStatus = WorkTaskStatus;
  currentAssigningWorkTasks?: WorkTask;
  validRoles: Role[] = [];

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("number"), index: 'number', width: 150},
    { title: this.i18n.fanyi("type"), index: 'type', width: 150},
    { title: this.i18n.fanyi("status"), index: 'status', width: 100},
    { title: this.i18n.fanyi("priority"), index: 'priority', width: 100},
    { title: this.i18n.fanyi("sourceLocation"), index: 'sourceLocation.name', width: 150},
    { title: this.i18n.fanyi("destinationLocation"), index: 'destinationLocation.name', width: 150},
    { title: this.i18n.fanyi("referenceNumber"), index: 'referenceNumber', width: 150},
    { title: this.i18n.fanyi("assignedUser"), index: 'assignedUser.username', width: 150},
    { title: this.i18n.fanyi("assignedRole"), index: 'assignedRole.name', width: 150},
    { title: this.i18n.fanyi("assignedWorkingTeam"), index: 'assignedWorkingTeam.name', width: 150},
    { title: this.i18n.fanyi("currentUser"), index: 'currentUser.uername', width: 150},
    { title: this.i18n.fanyi("completeUser"), index: 'completeUser.uername', width: 150},
    { title: this.i18n.fanyi("startTime"), index: 'startTime', width: 150},
    { title: this.i18n.fanyi("completeTime"), index: 'completeTime', width: 150},
    { 
      title: this.i18n.fanyi("action"),fixed: 'right',width: 150, 
      render: 'actionColumn',
      iif: () => !this.displayOnly
    }, 
   
  ];


  displayOnly = false;
  userPermissionMap: Map<string, boolean> = new Map<string, boolean>([
    ['assign-user', false], 
    ['assign-role', false], 
    ['assign-working-team', false], 
  ]);

  constructor(private http: _HttpClient,    
    private workTaskService: WorkTaskService, 
    private messageService: NzMessageService,
    private userService: UserService,
    private fb: UntypedFormBuilder, 
    private roleService: RoleService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService, 
    private activatedRoute: ActivatedRoute,  ) { 
    userService.isCurrentPageDisplayOnly("/work-task/work-task").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );
    userService.getUserPermissionByWebPage("/work-task/work-task").subscribe({
      next: (userPermissionRes) => {
        userPermissionRes.forEach(
          userPermission => this.userPermissionMap.set(userPermission.permission.name, userPermission.allowAccess)
        )
      }
    });
  }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      number: [null],
      type: [null],
      status: [null],
      sourceLocationName: [null],
      assignedUserName: [null],
      assignedRoleName: [null], 
    });
    
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.number ) {
        this.searchForm.controls.number.setValue(params.number); 
        this.search();
      }
    });

    this.roleService.getRoles(undefined, true).subscribe({
      next: (rolesRes) => this.validRoles = rolesRes
    })
  }

  
  resetForm(): void {
    this.searchForm.reset();
    this.workTasks = []; 

  }

  search(): void {
    this.isSpinning = true;
    this.searchResult = ''; 

    this.workTaskService.getWorkTasks(
      this.searchForm.controls.number.value, 
      this.searchForm.controls.type.value, 
      this.searchForm.controls.status.value, 
      this.searchForm.controls.sourceLocationName.value, 
      this.searchForm.controls.assignedUserName.value, 
      this.searchForm.controls.assignedRoleName.value, ).subscribe({

        next: (workTasksRes) => {
          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: workTasksRes.length,
          });
          
          this.workTasks = workTasksRes;
        }, 
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        },
      });
  }

  //  ===============  Assign User Modal  ================
  @ViewChild('userTable', { static: false }) 
  private userTable!: STComponent;

  userTablecolumns: STColumn[] = [
    { title: '', index: 'id', type: 'radio', width: 70 },
    { title: this.i18n.fanyi('username'),  index: 'username' }, 
    { title: this.i18n.fanyi('firstname'),  index: 'firstname' }, 
    { title: this.i18n.fanyi('lastname'),  index: 'lastname' }, 
  ];
 
  // Form related data and functions
  queryUserModal!: NzModalRef;
  searchUserForm!: UntypedFormGroup;
 
  queryUserInProcess = false;
  searchUserResult = '';

  selectedUserId?: number;
  // Table data for display
  listOfAssignableUsers: User[] = [];   

  resetUserForm(): void {
    this.searchUserForm.reset();
    this.listOfAssignableUsers = []; 
    this.selectedUserId = undefined;
  }

  searchUser(): void {
    this.queryUserInProcess = true;
    this.searchUserResult = '';
    this.selectedUserId = undefined;
    this.userService
      .getUsers(
        this.searchUserForm.value.username,
        undefined,
        undefined,
        this.searchUserForm.value.firstname,
        this.searchUserForm.value.lastname,
        this.currentAssigningWorkTasks!.id
      )
      .subscribe({
        next: (userRes) => {

          this.listOfAssignableUsers = userRes; 

          this.queryUserInProcess = false;
          this.searchUserResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: userRes.length,
          });
        }, 
        error: () => {
          this.queryUserInProcess = false;
          this.searchUserResult = '';
        },
      });
  } 

  openAssignUserModal(
    workTask: WorkTask,
    tplAssignUserModalTitle: TemplateRef<{}>,
    tplAssignUserModalContent: TemplateRef<{}>,
    tplAssignUserModalFooter: TemplateRef<{}>,
  ): void {

    this.listOfAssignableUsers = []; 
    this.currentAssigningWorkTasks = workTask;
    this.queryUserInProcess = false;

    this.createUserQueryForm();

    // show the model
    this.queryUserModal = this.modalService.create({
      nzTitle: tplAssignUserModalTitle,
      nzContent: tplAssignUserModalContent,
      nzFooter: tplAssignUserModalFooter,

      nzWidth: 1000,
    });

  }
 
  createUserQueryForm(): void {
    // initiate the search form
    this.searchUserForm = this.fb.group({ 
      username: [null], 
      firstname: [null], 
      lastname: [null],
    });
 
  }
  closeUserQueryModal(): void {
    this.queryUserModal.destroy();
  } 
  userTableChanged(ret: STChange): void {
    console.log('change', ret);
    if (ret.type == 'radio') {
      this.selectedUserId = undefined;
      if (ret.radio != null && ret.radio!.id != null) {
        console.log(`chosen user ${ret.radio!.id} / ${ret.radio!.username}`);
        this.selectedUserId = ret.radio!.id;
      }
    }
  }
  isUserRecordChecked() {
    return  this.selectedUserId != undefined;
  }
  assignUser() {
    if (this.currentAssigningWorkTasks == null) {      
      this.messageService.error("Fail to load the work task to be assigned, please try again");
      this.queryUserInProcess = false;
      this.queryUserModal.destroy();
      return;
    }
    this.queryUserInProcess = true;
    if (this.selectedUserId == undefined) {
      this.messageService.error("please select a user to continue");
      this.queryUserInProcess = false;
      return;
    }
    this.workTaskService.assignUser(this.currentAssigningWorkTasks.id, this.selectedUserId).subscribe({
      next: (workTaskRes) => {
        this.queryUserInProcess = false;
        this.queryUserModal.destroy();
        this.searchForm.controls.number.setValue(workTaskRes.number);
        this.search();
      }, 
      error: () => this.queryUserInProcess = false
    });

  }
  //  ===============  Assign Role Modal  ================
  @ViewChild('roleTable', { static: false }) 
  private roleTable!: STComponent;

  roleTablecolumns: STColumn[] = [
    { title: '', index: 'id', type: 'radio', width: 70 },
    { title: this.i18n.fanyi('name'),  index: 'name' }, 
    { title: this.i18n.fanyi('description'),  index: 'description' },  
  ];

  // Form related data and functions
  queryRoleModal!: NzModalRef;
  searchRoleForm!: UntypedFormGroup;

  queryRoleInProcess = false;
  searchRoleResult = '';

  selectedRoleId?: number;
  // Table data for display
  listOfAssignableRoles: Role[] = [];   

  resetRoleForm(): void {
    this.searchRoleForm.reset();
    this.listOfAssignableRoles = []; 
    this.selectedRoleId = undefined;
  }

  searchRole(): void {
    this.queryRoleInProcess = true;
    this.searchRoleResult = '';
    this.selectedRoleId = undefined;
    this.roleService
      .getRoles(
        this.searchRoleForm.value.rolename, 
        true,
        this.currentAssigningWorkTasks!.id
      )
      .subscribe({
        next: (roleRes) => {

          this.listOfAssignableRoles = roleRes; 

          this.queryRoleInProcess = false;
          this.searchRoleResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: roleRes.length,
          });
        }, 
        error: () => {
          this.queryRoleInProcess = false;
          this.searchRoleResult = '';
        },
      });
  } 

  openAssignRoleModal(
    workTask: WorkTask,
    tplAssignRoleModalTitle: TemplateRef<{}>,
    tplAssignRoleModalContent: TemplateRef<{}>,
    tplAssignRoleModalFooter: TemplateRef<{}>,
  ): void {

    this.listOfAssignableRoles = []; 
    this.currentAssigningWorkTasks = workTask;
    this.queryRoleInProcess = false;

    this.createRoleQueryForm();

    // show the model
    this.queryRoleModal = this.modalService.create({
      nzTitle: tplAssignRoleModalTitle,
      nzContent: tplAssignRoleModalContent,
      nzFooter: tplAssignRoleModalFooter,

      nzWidth: 1000,
    });

  }

  createRoleQueryForm(): void {
    // initiate the search form
    this.searchRoleForm = this.fb.group({ 
      rolename: [null],  
    });

  }
  closeRoleQueryModal(): void {
    this.queryRoleModal.destroy();
  } 
  roleTableChanged(ret: STChange): void { 
    if (ret.type == 'radio') {
      this.selectedRoleId = undefined;
      if (ret.radio != null && ret.radio!.id != null) { 
        this.selectedRoleId = ret.radio!.id;
      }
    }
  }
  isRoleRecordChecked() {
    return  this.selectedRoleId != undefined;
  }
  assignRole() {
    if (this.currentAssigningWorkTasks == null) {      
      this.messageService.error("Fail to load the work task to be assigned, please try again");
      this.queryRoleInProcess = false;
      this.queryRoleModal.destroy();
      return;
    }
    this.queryRoleInProcess = true;
    if (this.selectedRoleId == undefined) {
      this.messageService.error("please select a role to continue");
      this.queryRoleInProcess = false;
      return;
    }
    this.workTaskService.assignRole(this.currentAssigningWorkTasks.id, this.selectedRoleId).subscribe({
      next: (workTaskRes) => {
        this.queryRoleInProcess = false;
        this.queryRoleModal.destroy();
        this.searchForm.controls.number.setValue(workTaskRes.number);
        this.search();
      }, 
      error: () => this.queryRoleInProcess = false
    })

  }

  releaseWorkTask(workTask: WorkTask) {

    this.isSpinning = true;
    this.workTaskService.releaseWorkTask(workTask.id).subscribe({
      next: (workTaskRes) => {
        this.isSpinning = false;
        this.search();
      }, 
      error: () => this.isSpinning = false
    });
  }
}
