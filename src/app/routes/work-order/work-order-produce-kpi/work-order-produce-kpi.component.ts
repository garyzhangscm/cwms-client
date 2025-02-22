import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { WorkingTeamService } from '../../auth/services/working-team.service';
import { KpiMeasurement } from '../models/kpi-measurement.enum';
import { WorkOrder } from '../models/work-order';
import { WorkOrderKpi } from '../models/work-order-kpi';
import { WorkOrderKpiTransaction } from '../models/work-order-kpi-transaction';
import { WorkOrderKpiTransactionType } from '../models/work-order-kpi-transaction-type.enum';
import { WorkOrderProduceTransaction } from '../models/work-order-produce-transaction';
import { WorkOrderCompleteTransactionService } from '../services/work-order-complete-transaction.service';

@Component({
    selector: 'app-work-order-work-order-produce-kpi',
    templateUrl: './work-order-produce-kpi.component.html',
    styleUrls: ['./work-order-produce-kpi.component.less'],
    standalone: false
})
export class WorkOrderWorkOrderProduceKpiComponent implements OnInit {
  workOrderProduceTransaction!: WorkOrderProduceTransaction;
  currentWorkOrder!: WorkOrder;

  pageTitle: string;

  validUsernames: string[] = [];
  validWorkingTeamNames: string[] = [];

  kpiMeasurements = KpiMeasurement;
  kpiMeasurementsKeys = Object.keys(this.kpiMeasurements);

  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private router: Router,
    private workOrderCompleteTransactionService: WorkOrderCompleteTransactionService,
    private messageService: NzMessageService,
    private workingTeamService: WorkingTeamService,
    private userService: UserService,
  ) {
    this.pageTitle = this.i18n.fanyi('steps.work-order-produce.user-kpi.title');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('steps.work-order-produce.user-kpi.title'));

    this.workOrderProduceTransaction = JSON.parse(sessionStorage.getItem('currentWorkOrderProduceTransaction')!);
    this.currentWorkOrder = this.workOrderProduceTransaction.workOrder!;
    console.log(`this.this.currentWorkOrder: ${JSON.stringify(this.currentWorkOrder)}`);

    this.initialUsernameList();
    this.initialWorkingTeamList();
  }

  initialUsernameList(): void {
    this.validUsernames = [];
    this.userService.getUsers().subscribe(usersRes => {
      usersRes.forEach(user => {
        this.validUsernames.push(user.username);
      });
    });
  }
  initialWorkingTeamList(): void {
    this.validWorkingTeamNames = [];
    this.workingTeamService.getWorkingTeams().subscribe(workingTeamsRes => {
      workingTeamsRes.forEach(workingTeam => {
        this.validWorkingTeamNames.push(workingTeam.name);
      });
      console.log(`this.validWorkingTeamNames: ${this.validWorkingTeamNames}`);
    });
  }
  removeKPI(workOrderKpiTransaction: WorkOrderKpiTransaction): void {
    this.workOrderProduceTransaction.workOrderKPITransactions = this.workOrderProduceTransaction.workOrderKPITransactions.filter(
      existingWorkOrderKpiTransaction => existingWorkOrderKpiTransaction.username !== workOrderKpiTransaction.username,
    );
  }
  addExtraKPI(): void {
    this.workOrderProduceTransaction.workOrderKPITransactions = [
      ...this.workOrderProduceTransaction.workOrderKPITransactions,
      this.getEmptyWorkOrderKPITransaction(),
    ];
  }
  getEmptyWorkOrderKPITransaction(): WorkOrderKpiTransaction {
    return {
      id: undefined,
      workOrder: this.currentWorkOrder,
      workOrderCompleteTransaction: undefined,
      workOrderProduceTransaction: undefined,
      type: WorkOrderKpiTransactionType.ADD,
      username: '',
      workingTeamName: '',
      kpiMeasurement: KpiMeasurement.BY_QUANTITY,
      amount: 0,
    };
  }
  saveCurrentWorkOrderResults(): void {
    console.log(`kpi 1: \n ${JSON.stringify(this.workOrderProduceTransaction.workOrderKPITransactions)}`);
    sessionStorage.setItem('currentWorkOrderProduceTransaction', JSON.stringify(this.workOrderProduceTransaction));
  }
  onIndexChange(index: number): void {
    sessionStorage.setItem('currentWorkOrderProduceTransaction', JSON.stringify(this.workOrderProduceTransaction));
    console.log(`kpi 2: \n ${JSON.stringify(this.workOrderProduceTransaction.workOrderKPITransactions)}`);
    switch (index) {
      case 0:
        this.router.navigateByUrl(`/work-order/work-order/produce?id=${this.workOrderProduceTransaction.workOrder!.id}`);
        break;
      case 1:
        this.router.navigateByUrl(
          `/work-order/work-order/produce/by-product?id=${this.workOrderProduceTransaction.workOrder!.id}`,
        );
        break;
      case 2:
        this.router.navigateByUrl(
          `/work-order/work-order/produce/kpi?id=${this.workOrderProduceTransaction.workOrder!.id}`,
        );
        break;
      case 3:
        this.router.navigateByUrl(
          `/work-order/work-order/produce/confirm?id=${this.workOrderProduceTransaction.workOrder!.id}`,
        );
        break;
    }
  }
}
