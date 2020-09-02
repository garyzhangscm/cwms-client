import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { WorkOrderProduceTransaction } from '../models/work-order-produce-transaction';
import { WorkOrder } from '../models/work-order';
import { KpiMeasurement } from '../models/kpi-measurement.enum';
import { I18NService } from '@core';
import { Router } from '@angular/router';
import { WorkOrderCompleteTransactionService } from '../services/work-order-complete-transaction.service';
import { NzMessageService } from 'ng-zorro-antd';
import { UserService } from '../../auth/services/user.service';
import { WorkOrderKpi } from '../models/work-order-kpi';
import { WorkingTeamService } from '../../auth/services/working-team.service';
import { WorkOrderKpiTransaction } from '../models/work-order-kpi-transaction';
import { WorkOrderKpiTransactionType } from '../models/work-order-kpi-transaction-type.enum';

@Component({
  selector: 'app-work-order-work-order-produce-kpi',
  templateUrl: './work-order-produce-kpi.component.html',
  styleUrls: ['./work-order-produce-kpi.component.less'],
})
export class WorkOrderWorkOrderProduceKpiComponent implements OnInit {
  workOrderProduceTransaction: WorkOrderProduceTransaction;
  currentWorkOrder: WorkOrder;

  pageTitle: string;

  validUsernames: string[];
  validWorkingTeamNames: string[];

  kpiMeasurements = KpiMeasurement;

  constructor(
    private i18n: I18NService,
    private titleService: TitleService,
    private router: Router,
    private workOrderCompleteTransactionService: WorkOrderCompleteTransactionService,
    private messageService: NzMessageService,
    private workingTeamService: WorkingTeamService,
    private userService: UserService,
  ) {
    this.pageTitle = this.i18n.fanyi('steps.work-order-produce.user-kpi.title');
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('steps.work-order-produce.user-kpi.title'));

    this.workOrderProduceTransaction = JSON.parse(sessionStorage.getItem('currentWorkOrderProduceTransaction'));
    this.currentWorkOrder = this.workOrderProduceTransaction.workOrder;
    console.log(`this.this.currentWorkOrder: ${JSON.stringify(this.currentWorkOrder)}`);

    this.initialUsernameList();
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
  initialWorkingTeamList() {
    this.validWorkingTeamNames = [];
    this.workingTeamService.getWorkingTeams().subscribe(workingTeamsRes => {
      workingTeamsRes.forEach(workingTeam => {
        this.validWorkingTeamNames.push(workingTeam.name);
      });
      console.log(`this.validWorkingTeamNames: ${this.validWorkingTeamNames}`);
    });
  }
  removeKPI(workOrderKpiTransaction: WorkOrderKpiTransaction) {
    this.workOrderProduceTransaction.workOrderKPITransactions = this.workOrderProduceTransaction.workOrderKPITransactions.filter(
      existingWorkOrderKpiTransaction => existingWorkOrderKpiTransaction.username !== workOrderKpiTransaction.username,
    );
  }
  addExtraKPI() {
    this.workOrderProduceTransaction.workOrderKPITransactions = [
      ...this.workOrderProduceTransaction.workOrderKPITransactions,
      this.getEmptyWorkOrderKPITransaction(),
    ];
  }
  getEmptyWorkOrderKPITransaction(): WorkOrderKpiTransaction {
    return {
      id: null,
      workOrder: this.currentWorkOrder,
      workOrderCompleteTransaction: null,
      workOrderProduceTransaction: null,
      type: WorkOrderKpiTransactionType.ADD,
      username: '',
      workingTeamName: '',
      kpiMeasurement: KpiMeasurement.BY_QUANTITY,
      amount: 0,
    };
  }
  saveCurrentWorkOrderResults() {
    console.log(`kpi 1: \n ${JSON.stringify(this.workOrderProduceTransaction.workOrderKPITransactions)}`);
    sessionStorage.setItem('currentWorkOrderProduceTransaction', JSON.stringify(this.workOrderProduceTransaction));
  }
  onIndexChange(index: number) {
    sessionStorage.setItem('currentWorkOrderProduceTransaction', JSON.stringify(this.workOrderProduceTransaction));
    console.log(`kpi 2: \n ${JSON.stringify(this.workOrderProduceTransaction.workOrderKPITransactions)}`);
    switch (index) {
      case 0:
        this.router.navigateByUrl(`/work-order/work-order/produce?id=${this.workOrderProduceTransaction.workOrder.id}`);
        break;
      case 1:
        this.router.navigateByUrl(
          `/work-order/work-order/produce/by-product?id=${this.workOrderProduceTransaction.workOrder.id}`,
        );
        break;
      case 2:
        this.router.navigateByUrl(
          `/work-order/work-order/produce/kpi?id=${this.workOrderProduceTransaction.workOrder.id}`,
        );
        break;
      case 3:
        this.router.navigateByUrl(
          `/work-order/work-order/produce/confirm?id=${this.workOrderProduceTransaction.workOrder.id}`,
        );
        break;
    }
  }
}
