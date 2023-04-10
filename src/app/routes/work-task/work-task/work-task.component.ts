import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';

import { UserService } from '../../auth/services/user.service';
import { WorkTask } from '../models/work-task';
import { WorkTaskStatus } from '../models/work-task-status.enum';
import { WorkTaskType } from '../models/work-task-type.enum';
import { WorkTaskService } from '../services/work-task.service';

@Component({
  selector: 'app-work-task-work-task',
  templateUrl: './work-task.component.html',
})
export class WorkTaskWorkTaskComponent implements OnInit {

  searchForm!: UntypedFormGroup;
  searchResult = '';
  workTasks: WorkTask[] = [];

  isSpinning = false;
  workTaskTypes = WorkTaskType;
  workTaskStatus = WorkTaskStatus;


  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("number"), index: 'number', width: 50},
    { title: this.i18n.fanyi("type"), index: 'type', width: 50},
    { title: this.i18n.fanyi("status"), index: 'status', width: 50},
    { title: this.i18n.fanyi("sourceLocation"), index: 'sourceLocation.name', width: 50},
    { title: this.i18n.fanyi("destinationLocation"), index: 'destinationLocation.name', width: 50},
    { title: this.i18n.fanyi("referenceNumber"), index: 'referenceNumber', width: 50},
    { title: this.i18n.fanyi("assignedUser"), index: 'assignedUser.username', width: 50},
    { title: this.i18n.fanyi("assignedRole"), index: 'assignedRole.name', width: 50},
    { title: this.i18n.fanyi("assignedWorkingTeam"), index: 'assignedWorkingTeam.name', width: 50},
    { title: this.i18n.fanyi("currentUser"), index: 'currentUser.uername', width: 50},
    { title: this.i18n.fanyi("completeUser"), index: 'completeUser.uername', width: 50},
    { title: this.i18n.fanyi("startTime"), index: 'startTime', width: 50},
    { title: this.i18n.fanyi("completeTime"), index: 'completeTime', width: 50},
    { 
      title: this.i18n.fanyi("action"),fixed: 'right',width: 150, 
      render: 'actionColumn',
      iif: () => !this.displayOnly
    }, 
   
  ];


  displayOnly = false;
  userPermissionMap: Map<string, boolean> = new Map<string, boolean>([
    ['assign-user', false], 
  ]);

  constructor(private http: _HttpClient,    
    private workTaskService: WorkTaskService, 
    private userService: UserService,
    private fb: UntypedFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,) { 
    userService.isCurrentPageDisplayOnly("/outbound/order").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );
    userService.getUserPermissionByWebPage("/outbound/order").subscribe({
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

  assignUser(workTask: WorkTask) {}

}
