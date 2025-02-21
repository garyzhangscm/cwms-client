import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
 
import { UserService } from '../../auth/services/user.service';
import { WorkingTeamService } from '../../auth/services/working-team.service';
import { KpiMeasurement } from '../models/kpi-measurement.enum';
import { WorkOrder } from '../models/work-order';
import { WorkOrderCompleteTransaction } from '../models/work-order-complete-transaction';
import { WorkOrderKpi } from '../models/work-order-kpi';
import { WorkOrderKpiTransaction } from '../models/work-order-kpi-transaction';
import { WorkOrderKpiTransactionType } from '../models/work-order-kpi-transaction-type.enum';
import { WorkOrderCompleteTransactionService } from '../services/work-order-complete-transaction.service';
import { WorkOrderService } from '../services/work-order.service';

@Component({
    selector: 'app-work-order-work-order-complete-kpi',
    templateUrl: './work-order-complete-kpi.component.html',
    styleUrls: ['./work-order-complete-kpi.component.less'],
    standalone: false
})
export class WorkOrderWorkOrderCompleteKpiComponent implements OnInit {
  workOrderCompleteTransaction!: WorkOrderCompleteTransaction;

  currentWorkOrder!: WorkOrder;

  pageTitle = '';
  validUsernames: string[] = [];
  validWorkingTeamNames: string[] = [];

  kpiMeasurements = KpiMeasurement;
  existingWorkOrderKpis: WorkOrderKpi[] = [];

  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private router: Router,
    private userService: UserService,
    private workingTeamService: WorkingTeamService,
  ) {
    this.pageTitle = this.i18n.fanyi('steps.work-order-complete.user-kpi.title');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('steps.work-order-complete.user-kpi.title'));

    this.workOrderCompleteTransaction = JSON.parse(sessionStorage.getItem('workOrderCompleteTransaction')!);
    this.currentWorkOrder = this.workOrderCompleteTransaction.workOrder!;

    this.initialUsernameList();
    this.initialWorkingTeamList();
  }

  initialUsernameList(): void {
    this.validUsernames = [];
    this.userService.getUsers().subscribe(usersRes => {
      usersRes.forEach(user => {
        this.validUsernames.push(user.username);
      });
      console.log(`this.validUsernames: ${this.validUsernames}`);
    });
  }

  initialWorkingTeamList(): void {
    this.validWorkingTeamNames = [];
    this.workingTeamService.getWorkingTeams().subscribe(workingTeamsRes => {
      workingTeamsRes.forEach(workingTeam => {
        this.validWorkingTeamNames.push(workingTeam.name);
      });
    });
  }
  onStepsIndexChange(index: number): void {
    switch (index) {
      case 0:
        this.router.navigateByUrl('/work-order/work-order/complete?refresh');
        break;
      case 2:
        this.router.navigateByUrl(`/work-order/work-order/complete/confirm?id=${this.currentWorkOrder.id}`);
        break;
    }
  }
  removeKPI(workOrderKpiTransaction: WorkOrderKpiTransaction): void {
    console.log(`will remove work order kpi transaction ${JSON.stringify(workOrderKpiTransaction)}`)
    this.workOrderCompleteTransaction.workOrderKPITransactions = this.workOrderCompleteTransaction.workOrderKPITransactions.filter(
      existingWorkOrderKpiTransaction => {
        console.log(`check if we will need to remove ${JSON.stringify(existingWorkOrderKpiTransaction)}`)
        console.log(`workOrderKpiTransaction.workOrderKPI !== undefined: ${workOrderKpiTransaction.workOrderKPI !== undefined}`)
        if (workOrderKpiTransaction.workOrderKPI !== undefined) {
          return workOrderKpiTransaction.workOrderKPI!.id !== existingWorkOrderKpiTransaction.workOrderKPI?.id;

        }
        else {
          // if this is a new KPI transaction, then we will only allow one user per new transaction
          return existingWorkOrderKpiTransaction.workOrderKPI !== undefined ||
            existingWorkOrderKpiTransaction.username !== workOrderKpiTransaction.username;
        }
      }
    );
  }
  addExtraKPI(): void {
    this.workOrderCompleteTransaction.workOrderKPITransactions = [
      ...this.workOrderCompleteTransaction.workOrderKPITransactions,
      this.getEmptyWorkOrderKPITransaction(),
    ];
  }
  getEmptyWorkOrderKPITransaction(): WorkOrderKpiTransaction {
    return {
      id: undefined,
      workOrder: this.currentWorkOrder,
      workOrderCompleteTransaction: undefined,
      workOrderProduceTransaction: undefined,
      workOrderKPI: undefined,
      type: WorkOrderKpiTransactionType.ADD,
      username: '',
      workingTeamName: '',
      kpiMeasurement: KpiMeasurement.BY_QUANTITY,
      amount: 0,
    };
  }
  saveCurrentWorkOrderResults(): void {
    sessionStorage.setItem('workOrderCompleteTransaction', JSON.stringify(this.workOrderCompleteTransaction));
    this.router.navigateByUrl(`/work-order/work-order/complete/confirm?id=${this.currentWorkOrder.id}`);
  }
}
