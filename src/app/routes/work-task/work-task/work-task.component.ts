import { formatDate } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { RoleService } from '../../auth/services/role.service';
import { UserService } from '../../auth/services/user.service';
import { WorkingTeamService } from '../../auth/services/working-team.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { WorkStatus } from '../models/work-status.enum';
import { WorkTask } from '../models/work-task';
import { WorkType } from '../models/work-type.enum';
import { WorkTaskService } from '../services/work-task.service';



@Component({
  selector: 'app-work-task-work-task',
  templateUrl: './work-task.component.html',
  styleUrls: ['./work-task.component.less'],
})
export class WorkTaskWorkTaskComponent implements OnInit {
  
  
  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private titleService: TitleService,
    private modalService: NzModalService,
    private workTaskService: WorkTaskService,
    private message: NzMessageService,
    private workingTeamService: WorkingTeamService,
    private userService: UserService,
    private roleService: RoleService,
    private utilService: UtilService,
  ) {}

    listOfSelection = [
    {
      text: this.i18n.fanyi(`select-all-rows`),
      onSelect: () => {
        this.onAllChecked(true);
      }
    },    
  ];
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<number>();

  listOfColumns: ColumnItem[] = [
    {
      name: 'work-task.number',
      sortOrder: null,
      sortFn: (a: WorkTask, b: WorkTask) => a.number.localeCompare(b.number),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null, 
      showFilter: false
    },
    {
      name: 'work-task.type',
      sortOrder: null,
      sortFn: (a: WorkTask, b: WorkTask) => a.workType.localeCompare(b.workType),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null, 
      showFilter: false
    },
    {
      name: 'work-task.status',
      sortOrder: null,
      sortFn: (a: WorkTask, b: WorkTask) => a.workStatus.localeCompare(b.workStatus),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null, 
      showFilter: false
    },
    {
      name: 'sourceLocation',
      sortOrder: null,
      sortFn: (a: WorkTask, b: WorkTask) => a.sourceLocationId - a.sourceLocationId,
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null, 
      showFilter: false
    },
    {
      name: 'destinationLocation',
      sortOrder: null,
      sortFn: (a: WorkTask, b: WorkTask) => a.destinationLocationId - b.destinationLocationId,
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null, 
      showFilter: false
    },
    {
      name: 'lpn',
      sortOrder: null,
      sortFn: (a: WorkTask, b: WorkTask) => a.inventory?.lpn!.localeCompare(b.inventory?.lpn!),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null, 
      showFilter: false
    },
    {
      name: 'assignedUser',
      sortOrder: null,
      sortFn: (a: WorkTask, b: WorkTask) => a.assignedUserId - b.assignedUserId,
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null, 
      showFilter: false
    },
    {
      name: 'assignedRole',
      sortOrder: null,
      sortFn: (a: WorkTask, b: WorkTask) => a.assignedRoleId - b.assignedRoleId,
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null, 
      showFilter: false
    },
    {
      name: 'assignedWorkingTeam',
      sortOrder: null,
      sortFn: (a: WorkTask, b: WorkTask) => a.assignedWorkingTeamId - b.assignedWorkingTeamId,
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null, 
      showFilter: false
    },
    {
      name: 'currentUser',
      sortOrder: null,
      sortFn: (a: WorkTask, b: WorkTask) => a.currentUserId - b.currentUserId,
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null, 
      showFilter: false
    },
    {
      name: 'completeUser',
      sortOrder: null,
      sortFn: (a: WorkTask, b: WorkTask) => a.completeUserId - b.completeUserId,
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null, 
      showFilter: false
    },
    {
      name: 'startTime',
      sortOrder: null,
      sortFn: (a: WorkTask, b: WorkTask) => this.utilService.compareDateTime(a.startTime, b.startTime),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null, 
      showFilter: false
    },
    {
      name: 'completeTime',
      sortOrder: null,
      sortFn: (a: WorkTask, b: WorkTask) => this.utilService.compareDateTime(a.completeTime, b.completeTime),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null, 
      showFilter: false
    }
  ];
  searchForm: FormGroup | undefined;
  searching = false;
  searchResult = '';

  assignWorkTaskModal: NzModalRef | undefined;
  assignWorkTaskForm: FormGroup | undefined;
  assigningInProcess = false;

  workTypes = WorkType;
  workStatuses = WorkStatus;

  listOfAllWorkTasks: WorkTask[] | undefined;
  listOfDisplayWorkTasks: WorkTask[] | undefined;
  // work tasks that to be assigned to
  // user / role / working team
  currentAssigningWorkTaks: WorkTask[] | undefined;

  validUsernames: string[] | undefined;
  validRolenames: string[] | undefined;
  validWorkingTeamNames: string[] | undefined;
  
  
  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.work-task.title'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      type: [null],
      status: [null],
      lpn: [null],
      sourceLocation: [null],
      destinationLocation: [null],
      assignedUser: [null],
      assignedRole: [null],
      assignedWorkingTeam: [null],
      currentUser: [null],
      completeUser: [null],
    });
    this.initialUsernameList();
    this.initialRolenameList();
    this.initialWorkingTeamList();
  }

  initialUsernameList(): void {
    this.validUsernames = [];
    this.userService.getUsers().subscribe(usersRes => {
      usersRes.forEach(user => {
        this.validUsernames!.push(user.username);
      });
    });
  }
  initialRolenameList(): void {
    this.validRolenames = [];
    this.roleService.getRoles().subscribe(rolesRes => {
      rolesRes.forEach(role => {
        this.validRolenames!.push(role.name);
      });
    });
  }
  initialWorkingTeamList(): void {
    this.validWorkingTeamNames = [];
    this.workingTeamService.getWorkingTeams().subscribe(workingTeamsRes => {
      workingTeamsRes.forEach(workingTeam => {
        this.validWorkingTeamNames!.push(workingTeam.name);
      });
      console.log(`this.validWorkingTeamNames: ${this.validWorkingTeamNames}`);
    });
  }

  resetForm(): void {
    this.searchForm!.reset();
    this.listOfAllWorkTasks = [];
    this.listOfDisplayWorkTasks = [];
  }

  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.workTaskService
      .getWorkTasks(
        this.searchForm!.controls.number.value,
        this.searchForm!.controls.type.value,
        this.searchForm!.controls.status.value,
        this.searchForm!.controls.lpn.value,
        this.searchForm!.controls.sourceLocation.value,
        this.searchForm!.controls.destinationLocation.value,
        this.searchForm!.controls.assignedUser.value,
        this.searchForm!.controls.assignedRole.value,
        this.searchForm!.controls.assignedWorkingTeam.value,
        this.searchForm!.controls.currentUser.value,
        this.searchForm!.controls.completeUser.value,
      )
      .subscribe(
        workTaskResource => {
          this.listOfAllWorkTasks = workTaskResource;
          this.listOfDisplayWorkTasks = workTaskResource;
          this.searching = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: workTaskResource.length,
          });
        },
        () => {
          this.searching = false;
          this.searchResult = '';
        },
      );
  } 

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfDisplayWorkTasks!.forEach(item => this.updateCheckedSet(item.id, value));
    this.refreshCheckedStatus();
  }

  currentPageDataChange($event: WorkTask[]): void {
    this.listOfDisplayWorkTasks! = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfDisplayWorkTasks!.every(item => this.setOfCheckedId.has(item.id));
    this.indeterminate = this.listOfDisplayWorkTasks!.some(item => this.setOfCheckedId.has(item.id)) && !this.checked;
  }


  openAssignWorkTaskModalForSingleWorkTask(
    workTask: WorkTask,
    tplAssignWorkTaskModalTitle: TemplateRef<{}>,
    tplAssignWorkTaskModalContent: TemplateRef<{}>,
    tplAssignWorkTaskModalFooter: TemplateRef<{}>,
  ): void {
    this.currentAssigningWorkTaks = [workTask];

    this.openAssignWorkTaskModal(
      tplAssignWorkTaskModalTitle,
      tplAssignWorkTaskModalContent,
      tplAssignWorkTaskModalFooter,
    );
  }

  openAssignWorkTaskModalForMultipleTasks(
    tplAssignWorkTaskModalTitle: TemplateRef<{}>,
    tplAssignWorkTaskModalContent: TemplateRef<{}>,
    tplAssignWorkTaskModalFooter: TemplateRef<{}>,
  ): void {
    this.currentAssigningWorkTaks = [...this.getSelectedWorkTasks()];

    this.openAssignWorkTaskModal(
      tplAssignWorkTaskModalTitle,
      tplAssignWorkTaskModalContent,
      tplAssignWorkTaskModalFooter,
    );
  }
  
  getSelectedWorkTasks(): WorkTask[] {
    const selectedWorkTasks: WorkTask[] = [];
    this.listOfAllWorkTasks!.forEach((workTask: WorkTask) => {
      if (this.setOfCheckedId.has(workTask.id)) {
        selectedWorkTasks.push(workTask);
      }
    });
    return selectedWorkTasks;
  }
openAssignWorkTaskModal(
  tplAssignWorkTaskModalTitle: TemplateRef<{}>,
  tplAssignWorkTaskModalContent: TemplateRef<{}>,
  tplAssignWorkTaskModalFooter: TemplateRef<{}>,
  ): void {
    this.createAssignWorkTaskForm();
    this.assigningInProcess = false;

    // show the model
    this.assignWorkTaskModal = this.modalService.create({
      nzTitle: tplAssignWorkTaskModalTitle,
      nzContent: tplAssignWorkTaskModalContent,
      nzFooter: tplAssignWorkTaskModalFooter,

      nzWidth: 1000,
    });
  }
createAssignWorkTaskForm(): void {
    this.assignWorkTaskForm = this.fb.group({
      username: [null],
      rolename: [null],
      workingTeamName: [null],
    });
  }

closeAssignWorkTaskModal(): void{
    this.assigningInProcess = true;
    this.assignWorkTaskModal!.destroy();
  }

confirmWorkTaskAssignment(): void {
    this.assigningInProcess = true;
    this.assignWorkTask();
  }

assignWorkTask(): void {
    // make sure we at least have one value filled in
    if (this.assignWorkTaskForm!.valid) {
      // check if the location name is input. If so, we receive into that location
      // otherwise, we receive into the reciept location

      this.workTaskService
        .assignWorkTasks(
          this.currentAssigningWorkTaks!,
          this.assignWorkTaskForm!.controls.username.value,
          this.assignWorkTaskForm!.controls.rolename.value,
          this.assignWorkTaskForm!.controls.workingTeamName.value,
        )
        .subscribe(
          () => {
            this.message.success(this.i18n.fanyi('message.work-task-assignment.success'));

            this.assignWorkTaskModal!.destroy();
            this.assigningInProcess = false;

            this.search();
          },
          () => (this.assigningInProcess = false),
        );
    } else {
      this.displayAssignWorkTaskFormError(this.assignWorkTaskForm!);
      this.assigningInProcess = false;
    }
  }

displayAssignWorkTaskFormError(fromGroup: FormGroup): void {
    // tslint:disable-next-line: forin
    for (const i in fromGroup.controls) {
      fromGroup.controls[i].markAsDirty();
      fromGroup.controls[i].updateValueAndValidity();
    }
  }
deassignMultipleTasks(): void {
    this.getSelectedWorkTasks().forEach(workTask => this.deassignWorkTask(workTask));
  }
deassignWorkTask(workTask: WorkTask): void {}



}
