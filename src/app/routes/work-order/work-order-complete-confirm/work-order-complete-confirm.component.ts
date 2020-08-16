import { Component, OnInit, TemplateRef } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { WorkOrderCompleteTransaction } from '../models/work-order-complete-transaction';
import { WorkOrder } from '../models/work-order';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { WorkOrderService } from '../services/work-order.service';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WorkOrderLineCompleteTransaction } from '../models/work-order-line-complete-transaction';
import { WorkOrderCompleteTransactionService } from '../services/work-order-complete-transaction.service';
import { KpiMeasurement } from '../models/kpi-measurement.enum';
import { WorkOrderKpi } from '../models/work-order-kpi';

interface KPI {
  username: string;
  workingTeamName: string;

  kpiMeasurement: KpiMeasurement;
  amount: number;
  originalKpiMeasurement: KpiMeasurement;
  originalAmount: number;
  changed: boolean;
}

@Component({
  selector: 'app-work-order-work-order-complete-confirm',
  templateUrl: './work-order-complete-confirm.component.html',
  styleUrls: ['./work-order-complete-confirm.component.less'],
})
export class WorkOrderWorkOrderCompleteConfirmComponent implements OnInit {
  workOrderCompleteTransaction: WorkOrderCompleteTransaction;

  currentWorkOrder: WorkOrder;

  pageTitle: string;

  savingInProcess: boolean;

  kpis: KPI[];

  constructor(
    private i18n: I18NService,
    private titleService: TitleService,
    private router: Router,
    private workOrderCompleteTransactionService: WorkOrderCompleteTransactionService,
    private messageService: NzMessageService,
    private workOrderService: WorkOrderService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.work-order.complete.confirm');
  }

  ngOnInit() {
    this.savingInProcess = false;
    this.titleService.setTitle(this.i18n.fanyi('page.work-order.complete.confirm'));

    this.workOrderCompleteTransaction = JSON.parse(sessionStorage.getItem('workOrderCompleteTransaction'));
    this.currentWorkOrder = this.workOrderCompleteTransaction.workOrder;
    this.initKPIs();
  }

  initKPIs() {
    // Init KPIs, we will show the modified KPIs and the original KPIs
    // so the user know what will happen after save the data
    this.kpis = [];

    this.workOrderService.getKPIs(this.currentWorkOrder).subscribe(workOrderKPIs => {
      console.log(`start to get KPIs`);
      // Let's loop through the update work order KPI
      // and see if this is a
      // 1. update transaction for existing KPI record
      // 2. New transaction for adding KPI record
      // 3. remove transaction to remove the KPI record
      let existingWorkOrderKpis = workOrderKPIs;
      console.log(`existing KPIs: ${JSON.stringify(existingWorkOrderKpis)}`);
      this.workOrderCompleteTransaction.workOrderKPITransactions.forEach(workOrderKPItransaction => {
        // We should only have one matched work order KPI
        console.log(`Start to process workOrderKPItransaction: ${JSON.stringify(workOrderKPItransaction)}`);
        const matchedWorkOrderKPIs = existingWorkOrderKpis.filter(
          workOrderKPI =>
            workOrderKPItransaction.username === workOrderKPI.username ||
            workOrderKPItransaction.workingTeamName === workOrderKPI.workingTeamName,
        );

        console.log(`matchedWorkOrderKPIs KPIs: ${JSON.stringify(matchedWorkOrderKPIs)}`);

        if (matchedWorkOrderKPIs.length > 0) {
          // OK, we are possibly updating existing work order KPI
          this.kpis = [
            ...this.kpis,
            {
              username: '' + workOrderKPItransaction.username,
              workingTeamName: '' + workOrderKPItransaction.workingTeamName,
              kpiMeasurement: workOrderKPItransaction.kpiMeasurement,
              amount: workOrderKPItransaction.amount,
              originalKpiMeasurement: matchedWorkOrderKPIs[0].kpiMeasurement,
              originalAmount: matchedWorkOrderKPIs[0].amount,
              changed:
                workOrderKPItransaction.kpiMeasurement !== matchedWorkOrderKPIs[0].kpiMeasurement ||
                workOrderKPItransaction.amount !== matchedWorkOrderKPIs[0].amount,
            },
          ];
          console.log(`changed: ${workOrderKPItransaction.amount === matchedWorkOrderKPIs[0].amount}`);
          console.log(`workOrderKPItransaction.amount: ${workOrderKPItransaction.amount}`);
          console.log(`matchedWorkOrderKPIs[0].amount: ${matchedWorkOrderKPIs[0].amount}`);
          // let's remove the matched KPIs from the original ist
          existingWorkOrderKpis = existingWorkOrderKpis.filter(
            workOrderKPI =>
              workOrderKPItransaction.username !== workOrderKPI.username &&
              workOrderKPItransaction.workingTeamName !== workOrderKPI.workingTeamName,
          );
        } else {
          // we are adding new KPI
          this.kpis = [
            ...this.kpis,
            {
              username: '' + workOrderKPItransaction.username,
              workingTeamName: '' + workOrderKPItransaction.workingTeamName,
              kpiMeasurement: workOrderKPItransaction.kpiMeasurement,
              amount: workOrderKPItransaction.amount,
              originalKpiMeasurement: null,
              originalAmount: null,
              changed: true,
            },
          ];
        }
      });

      // After matching existing KPI with the current transaction, if we still have record here, probably
      // we are removing those KPI record
      if (existingWorkOrderKpis.length > 0) {
        existingWorkOrderKpis.forEach(workOrderKPI => {
          this.kpis = [
            ...this.kpis,
            {
              username: '' + workOrderKPI.username,
              workingTeamName: '' + workOrderKPI.workingTeamName,
              kpiMeasurement: null,
              amount: null,
              originalKpiMeasurement: workOrderKPI.kpiMeasurement,
              originalAmount: workOrderKPI.amount,
              changed: true,
            },
          ];
        });
      }

      console.log(`After processing this.kpis, now we have \n${JSON.stringify(this.kpis)}`);
    });
  }

  getKPIbyUsername(workOrderKpis: WorkOrderKpi[], username: string): WorkOrderKpi {
    const matchedWorkOrderKpis = workOrderKpis.filter(workOrderKpi => workOrderKpi.username === username);
    if (matchedWorkOrderKpis.length > 0) {
      return matchedWorkOrderKpis[0];
    } else {
      return null;
    }
  }
  onStepsIndexChange(index: number) {}
  confirmWorkOrderComplete() {
    this.savingInProcess = true;
    this.workOrderCompleteTransactionService
      .saveWorkOrderCompleteTransaction(this.workOrderCompleteTransaction)
      .subscribe(res => {
        this.messageService.success(this.i18n.fanyi('message.work-order.produced-success'));
        setTimeout(() => {
          this.savingInProcess = false;
          this.router.navigateByUrl(
            `/work-order/work-order?number=${this.workOrderCompleteTransaction.workOrder.number}`,
          );
        }, 2500);
      });
  }
}
