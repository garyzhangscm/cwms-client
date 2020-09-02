import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { WorkOrderCompleteTransaction } from '../models/work-order-complete-transaction';
import { WorkOrder } from '../models/work-order';
import { I18NService } from '@core';
import { Router } from '@angular/router';
import { WorkOrderCompleteTransactionService } from '../services/work-order-complete-transaction.service';
import { NzMessageService } from 'ng-zorro-antd';
import { WorkOrderKpi } from '../models/work-order-kpi';
import { exists } from 'fs';
import { KpiMeasurement } from '../models/kpi-measurement.enum';
import { UserService } from '../../auth/services/user.service';
import { WorkingTeamService } from '../../auth/services/working-team.service';
import { WorkOrderKpiTransaction } from '../models/work-order-kpi-transaction';
import { WorkOrderService } from '../services/work-order.service';
import { WorkOrderKpiTransactionType } from '../models/work-order-kpi-transaction-type.enum';

@Component({
  selector: 'app-work-order-work-order-complete-kpi',
  templateUrl: './work-order-complete-kpi.component.html',
  styleUrls: ['./work-order-complete-kpi.component.less'],
})
export class WorkOrderWorkOrderCompleteKpiComponent implements OnInit {
  workOrderCompleteTransaction: WorkOrderCompleteTransaction;

  currentWorkOrder: WorkOrder;

  pageTitle: string;

  validUsernames: string[];
  validWorkingTeamNames: string[];

  kpiMeasurements = KpiMeasurement;
  existingWorkOrderKpis: WorkOrderKpi[];

  constructor(
    private i18n: I18NService,
    private titleService: TitleService,
    private router: Router,
    private workOrderCompleteTransactionService: WorkOrderCompleteTransactionService,
    private messageService: NzMessageService,
    private userService: UserService,
    private workingTeamService: WorkingTeamService,
    private workOrderService: WorkOrderService,
  ) {
    this.pageTitle = this.i18n.fanyi('steps.work-order-complete.user-kpi.title');
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('steps.work-order-complete.user-kpi.title'));

    this.workOrderCompleteTransaction = JSON.parse(sessionStorage.getItem('workOrderCompleteTransaction'));
    this.currentWorkOrder = this.workOrderCompleteTransaction.workOrder;

    this.initialUsernameList();
    this.initialWorkingTeamList();
  }

  initialUsernameList() {
    this.validUsernames = [];
    this.userService.getUsers().subscribe(usersRes => {
      usersRes.forEach(user => {
        this.validUsernames.push(user.username);
      });
      console.log(`this.validUsernames: ${this.validUsernames}`);
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
  onStepsIndexChange(index: number) {
    switch (index) {
      case 0:
        this.router.navigateByUrl('/work-order/work-order/complete?refresh');
        break;
      case 2:
        this.router.navigateByUrl(`/work-order/work-order/complete/confirm?id=${this.currentWorkOrder.id}`);
        break;
    }
  }
  removeKPI(workOrderKpiTransaction: WorkOrderKpi) {
    this.workOrderCompleteTransaction.workOrderKPITransactions = this.workOrderCompleteTransaction.workOrderKPITransactions.filter(
      existingWorkOrderKpiTransaction => existingWorkOrderKpiTransaction.username !== workOrderKpiTransaction.username,
    );
  }
  addExtraKPI() {
    this.workOrderCompleteTransaction.workOrderKPITransactions = [
      ...this.workOrderCompleteTransaction.workOrderKPITransactions,
      this.getEmptyWorkOrderKPITransaction(),
    ];
  }
  getEmptyWorkOrderKPITransaction(): WorkOrderKpiTransaction {
    return {
      id: null,
      workOrder: this.currentWorkOrder,
      workOrderCompleteTransaction: null,
      workOrderProduceTransaction: null,
      type: WorkOrderKpiTransactionType.OVERRIDE,
      username: '',
      workingTeamName: '',
      kpiMeasurement: KpiMeasurement.BY_QUANTITY,
      amount: 0,
    };
  }
  saveCurrentWorkOrderResults() {
    sessionStorage.setItem('workOrderCompleteTransaction', JSON.stringify(this.workOrderCompleteTransaction));
    this.router.navigateByUrl(`/work-order/work-order/complete/confirm?id=${this.currentWorkOrder.id}`);
  }
}
