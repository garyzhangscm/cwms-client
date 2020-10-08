import { formatDate } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzModalService, NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { RoleService } from '../../auth/services/role.service';
import { UserService } from '../../auth/services/user.service';
import { WorkingTeamService } from '../../auth/services/working-team.service';
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
  searchForm: FormGroup;
  searching = false;
  searchResult = '';

  assignWorkTaskModal: NzModalRef;
  assignWorkTaskForm: FormGroup;
  assigningInProcess = false;

  workTypes = WorkType;
  workStatuses = WorkStatus;

  listOfAllWorkTasks: WorkTask[];
  listOfDisplayWorkTasks: WorkTask[];
  // work tasks that to be assigned to
  // user / role / working team
  currentAssigningWorkTaks: WorkTask[];

  validUsernames: string[];
  validRolenames: string[];
  validWorkingTeamNames: string[];

  // checkbox - select all
  allChecked = false;
  indeterminate = false;
  isAllDisplayDataChecked = false;
  // list of checked checkbox
  mapOfCheckedId: { [key: string]: boolean } = {};

  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

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
  ) {}
  ngOnInit() {
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

  initialUsernameList() {
    this.validUsernames = [];
    this.userService.getUsers().subscribe(usersRes => {
      usersRes.forEach(user => {
        this.validUsernames.push(user.username);
      });
    });
  }
  initialRolenameList() {
    this.validRolenames = [];
    this.roleService.getRoles().subscribe(rolesRes => {
      rolesRes.forEach(role => {
        this.validRolenames.push(role.name);
      });
    });
  }
  initialWorkingTeamList() {
    this.validWorkingTeamNames = [];
    this.workingTeamService.getWorkingTeams().subscribe(workingTeamsRes => {
      workingTeamsRes.forEach(workingTeam => {
        this.validWorkingTeamNames.push(workingTeam.name);
      });
      console.log(`this.validWorkingTeamNames: ${this.validWorkingTeamNames}`);
    });
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllWorkTasks = [];
    this.listOfDisplayWorkTasks = [];
  }

  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.workTaskService
      .getWorkTasks(
        this.searchForm.controls.number.value,
        this.searchForm.controls.type.value,
        this.searchForm.controls.status.value,
        this.searchForm.controls.lpn.value,
        this.searchForm.controls.sourceLocation.value,
        this.searchForm.controls.destinationLocation.value,
        this.searchForm.controls.assignedUser.value,
        this.searchForm.controls.assignedRole.value,
        this.searchForm.controls.assignedWorkingTeam.value,
        this.searchForm.controls.currentUser.value,
        this.searchForm.controls.completeUser.value,
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

  currentPageDataChange($event: WorkTask[]): void {
    this.listOfDisplayWorkTasks = $event;
    this.refreshStatus();
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayWorkTasks.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayWorkTasks.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayWorkTasks.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;

    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayWorkTasks = this.listOfAllWorkTasks.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayWorkTasks = this.listOfAllWorkTasks;
    }
  }

  openAssignWorkTaskModalForSingleWorkTask(
    workTask: WorkTask,
    tplAssignWorkTaskModalTitle: TemplateRef<{}>,
    tplAssignWorkTaskModalContent: TemplateRef<{}>,
    tplAssignWorkTaskModalFooter: TemplateRef<{}>,
  ) {
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
  ) {
    this.currentAssigningWorkTaks = [...this.getSelectedWorkTasks()];

    this.openAssignWorkTaskModal(
      tplAssignWorkTaskModalTitle,
      tplAssignWorkTaskModalContent,
      tplAssignWorkTaskModalFooter,
    );
  }
  getSelectedWorkTasks(): WorkTask[] {
    const selectedWorkTasks: WorkTask[] = [];
    this.listOfAllWorkTasks.forEach((workTask: WorkTask) => {
      if (this.mapOfCheckedId[workTask.id] === true) {
        selectedWorkTasks.push(workTask);
      }
    });
    return selectedWorkTasks;
  }
  openAssignWorkTaskModal(
    tplAssignWorkTaskModalTitle: TemplateRef<{}>,
    tplAssignWorkTaskModalContent: TemplateRef<{}>,
    tplAssignWorkTaskModalFooter: TemplateRef<{}>,
  ) {
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
  createAssignWorkTaskForm() {
    this.assignWorkTaskForm = this.fb.group({
      username: [null],
      rolename: [null],
      workingTeamName: [null],
    });
  }

  closeAssignWorkTaskModal() {
    this.assigningInProcess = true;
    this.assignWorkTaskModal.destroy();
  }

  confirmWorkTaskAssignment() {
    this.assigningInProcess = true;
    this.assignWorkTask();
  }

  assignWorkTask() {
    // make sure we at least have one value filled in
    if (this.assignWorkTaskForm.valid) {
      // check if the location name is input. If so, we receive into that location
      // otherwise, we receive into the reciept location

      this.workTaskService
        .assignWorkTasks(
          this.currentAssigningWorkTaks,
          this.assignWorkTaskForm.controls.username.value,
          this.assignWorkTaskForm.controls.rolename.value,
          this.assignWorkTaskForm.controls.workingTeamName.value,
        )
        .subscribe(
          () => {
            this.message.success(this.i18n.fanyi('message.work-task-assignment.success'));

            this.assignWorkTaskModal.destroy();
            this.assigningInProcess = false;

            this.search();
          },
          () => (this.assigningInProcess = false),
        );
    } else {
      this.displayAssignWorkTaskFormError(this.assignWorkTaskForm);
      this.assigningInProcess = false;
    }
  }

  displayAssignWorkTaskFormError(fromGroup: FormGroup) {
    // tslint:disable-next-line: forin
    for (const i in fromGroup.controls) {
      fromGroup.controls[i].markAsDirty();
      fromGroup.controls[i].updateValueAndValidity();
    }
  }
  deassignMultipleTasks() {
    this.getSelectedWorkTasks().forEach(workTask => this.deassignWorkTask(workTask));
  }
  deassignWorkTask(workTask: WorkTask) {}
}
