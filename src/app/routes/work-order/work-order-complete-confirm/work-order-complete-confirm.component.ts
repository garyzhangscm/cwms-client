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

  constructor(
    private i18n: I18NService,
    private titleService: TitleService,
    private router: Router,
    private workOrderCompleteTransactionService: WorkOrderCompleteTransactionService,
    private messageService: NzMessageService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.work-order.complete.confirm');
  }

  ngOnInit() {
    this.savingInProcess = false;
    this.titleService.setTitle(this.i18n.fanyi('page.work-order.complete.confirm'));

    this.workOrderCompleteTransaction = JSON.parse(sessionStorage.getItem('workOrderCompleteTransaction'));
    this.currentWorkOrder = this.workOrderCompleteTransaction.workOrder;
  }

  onStepsIndexChange(index: number) {
    switch (index) {
      case 0:
        this.router.navigateByUrl('/work-order/work-order/complete?refresh');
        break;
      case 1:
        this.router.navigateByUrl('/work-order/work-order/complete/kpi');
        break;
    }
  }
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
