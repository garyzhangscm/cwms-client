import { Component, OnInit, TemplateRef } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { WorkOrderCompleteTransaction } from '../models/work-order-complete-transaction';
import { WorkOrder } from '../models/work-order';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { WorkOrderService } from '../services/work-order.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { WorkOrderLineCompleteTransaction } from '../models/work-order-line-complete-transaction';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { WorkOrderLine } from '../models/work-order-line';
import { WorkOrderKpi } from '../models/work-order-kpi';
import { WorkOrderKpiTransaction } from '../models/work-order-kpi-transaction';

@Component({
  selector: 'app-work-order-work-order-complete',
  templateUrl: './work-order-complete.component.html',
  styleUrls: ['./work-order-complete.component.less'],
})
export class WorkOrderWorkOrderCompleteComponent implements OnInit {
  workOrderCompleteTransaction: WorkOrderCompleteTransaction;

  currentWorkOrder: WorkOrder;

  pageTitle: string;
  returnMaterialForm: FormGroup;
  returnMaterialModal: NzModalRef;
  availableInventoryStatuses: InventoryStatus[];
  returningWorkOrderLine: WorkOrderLine;

  mapOfWorkOrderLineStatus: { [key: string]: boolean } = {};

  constructor(
    private activatedRoute: ActivatedRoute,
    private i18n: I18NService,
    private titleService: TitleService,
    private workOrderService: WorkOrderService,
    private inventoryStatusService: InventoryStatusService,
    private fb: FormBuilder,
    private modalService: NzModalService,
    private locationService: LocationService,
    private router: Router,
  ) {
    this.pageTitle = this.i18n.fanyi('page.work-order.complete');
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('page.work-order.complete'));

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.hasOwnProperty('refresh')) {
        this.workOrderCompleteTransaction = JSON.parse(sessionStorage.getItem('workOrderCompleteTransaction'));
        this.currentWorkOrder = this.workOrderCompleteTransaction.workOrder;
      } else if (params.id) {
        this.workOrderService.getWorkOrder(params.id).subscribe(workOrderRes => {
          this.currentWorkOrder = workOrderRes;
          this.setupEmptyWorkOrderCompleteTransaction(this.currentWorkOrder);
        });
      }
    });

    // initiate the select control
    this.inventoryStatusService.loadInventoryStatuses().subscribe(inventoryStatusRes => {
      this.availableInventoryStatuses = inventoryStatusRes;
    });
  }

  setupEmptyWorkOrderCompleteTransaction(workOrder: WorkOrder) {
    this.workOrderCompleteTransaction = {
      id: null,
      workOrder,
      workOrderLineCompleteTransactions: [],
      workOrderKPITransactions: [],
      workOrderByProductProduceTransactions: [],
    };
    workOrder.workOrderLines.forEach(workOrderLine => {
      this.workOrderCompleteTransaction.workOrderLineCompleteTransactions = [
        ...this.workOrderCompleteTransaction.workOrderLineCompleteTransactions,
        {
          id: null,
          returnMaterialRequests: [],
          workOrderLine,
          adjustedConsumedQuantity: workOrderLine.consumedQuantity,
          scrappedQuantity: 0,
        },
      ];
      // CHeck if we have all the quantity match
      // the delivered quantity  = consumed quantity + returned quantity + scrapped quantity
      // When initial the page, we should only have the delivered quantity and consumed quantity
      this.mapOfWorkOrderLineStatus[workOrderLine.id] =
        workOrderLine.deliveredQuantity === workOrderLine.consumedQuantity;
    });

    // init the work order KPI transaction
    this.workOrderService.getKPIs(this.currentWorkOrder).subscribe(workOrderKPIs => {
      // copy the existing work order KPIs into the transaction variable so
      // that we allow the user to change
      this.workOrderCompleteTransaction.workOrderKPITransactions = this.getWorkOrderKPITransaction(workOrderKPIs);
    });
  }

  getWorkOrderKPITransaction(workOrderKPIs: WorkOrderKpi[]): WorkOrderKpiTransaction[] {
    const workOrderKpiTransactions: WorkOrderKpiTransaction[] = [];
    workOrderKPIs.forEach(workOrderKPI => {
      workOrderKpiTransactions.push({
        id: null,
        workOrder: workOrderKPI.workOrder,
        workOrderCompleteTransaction: null,
        workOrderProduceTransaction: null,
        username: workOrderKPI.username,
        workingTeamName: workOrderKPI.workingTeamName,
        kpiMeasurement: workOrderKPI.kpiMeasurement,
        amount: workOrderKPI.amount,
      });
    });
    return workOrderKpiTransactions;
  }
  openReturnMaterialModal(
    workOrderLineCompleteTransaction: WorkOrderLineCompleteTransaction,
    tplReturnMaterialModalTitle: TemplateRef<{}>,
    tplReturnMaterialModalContent: TemplateRef<{}>,
  ) {
    this.returnMaterialForm = this.fb.group({
      itemNumber: new FormControl({ value: workOrderLineCompleteTransaction.workOrderLine.item.name, disabled: true }),
      itemDescription: new FormControl({
        value: workOrderLineCompleteTransaction.workOrderLine.item.description,
        disabled: true,
      }),
      lpn: [null],
      inventoryStatus: [null],
      itemPackageType: [null],
      quantity: [null],
      locationName: [null],
    });
    this.returningWorkOrderLine = workOrderLineCompleteTransaction.workOrderLine;

    this.returnMaterialModal = this.modalService.create({
      nzTitle: tplReturnMaterialModalTitle,
      nzContent: tplReturnMaterialModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.returnMaterialModal.destroy();
        // this.refreshReceiptResults();
      },
      nzOnOk: () => {
        this.addReturnMaterialRequest(
          workOrderLineCompleteTransaction,
          this.returnMaterialForm.controls.lpn.value,
          this.returnMaterialForm.controls.inventoryStatus.value,
          this.returnMaterialForm.controls.itemPackageType.value,
          this.returnMaterialForm.controls.quantity.value,
          this.returnMaterialForm.controls.locationName.value,
        );
      },
      nzWidth: 1000,
    });
  }

  addReturnMaterialRequest(
    workOrderLineCompleteTransaction: WorkOrderLineCompleteTransaction,
    lpn: string,
    inventoryStatusName: string,
    itemPackageTypeName: string,
    quantity: number,
    locationName: string,
  ) {
    const inventoryStatus = this.availableInventoryStatuses
      .filter(availableInventoryStatus => availableInventoryStatus.name === inventoryStatusName)
      .pop();
    const itemPackageType = workOrderLineCompleteTransaction.workOrderLine.item.itemPackageTypes
      .filter(availableItemPackageType => availableItemPackageType.name === itemPackageTypeName)
      .pop();
    if (locationName) {
      this.locationService.getLocations(null, null, locationName).subscribe(locationRes => {
        workOrderLineCompleteTransaction.returnMaterialRequests = [
          ...workOrderLineCompleteTransaction.returnMaterialRequests,
          {
            id: null,
            lpn,
            quantity,
            inventoryStatusId: inventoryStatus.id,
            inventoryStatus,
            itemPackageTypeId: itemPackageType.id,
            itemPackageType,

            locationId: locationRes[0].id,
            location: locationRes[0],
          },
        ];
        this.resetWorkOrderLineStatus(workOrderLineCompleteTransaction);
      });
    } else {
      workOrderLineCompleteTransaction.returnMaterialRequests = [
        ...workOrderLineCompleteTransaction.returnMaterialRequests,
        {
          id: null,
          lpn,
          quantity,
          inventoryStatusId: inventoryStatus.id,
          inventoryStatus,
          itemPackageTypeId: itemPackageType.id,
          itemPackageType,

          locationId: null,
          location: null,
        },
      ];
      this.resetWorkOrderLineStatus(workOrderLineCompleteTransaction);
    }
  }

  returningMaterialLPNChanged(lpn: string) {
    this.returnMaterialForm.controls.lpn.setValue(lpn);
  }

  consumeBalance(workOrderLineCompleteTransaction: WorkOrderLineCompleteTransaction) {
    // workOrderLineCompleteTransaction.returnMaterialRequests = [];
    const returnMaterialRequestQuantity = workOrderLineCompleteTransaction.returnMaterialRequests
      .map(returnMaterialRequest => returnMaterialRequest.quantity)
      .reduce((a, b) => a + b, 0);

    workOrderLineCompleteTransaction.adjustedConsumedQuantity =
      workOrderLineCompleteTransaction.workOrderLine.deliveredQuantity -
      returnMaterialRequestQuantity -
      workOrderLineCompleteTransaction.scrappedQuantity;

    this.resetWorkOrderLineStatus(workOrderLineCompleteTransaction);
  }
  scrapBalance(workOrderLineCompleteTransaction: WorkOrderLineCompleteTransaction) {
    const returnMaterialRequestQuantity = workOrderLineCompleteTransaction.returnMaterialRequests
      .map(returnMaterialRequest => returnMaterialRequest.quantity)
      .reduce((a, b) => a + b, 0);

    workOrderLineCompleteTransaction.scrappedQuantity =
      workOrderLineCompleteTransaction.workOrderLine.deliveredQuantity -
      returnMaterialRequestQuantity -
      workOrderLineCompleteTransaction.adjustedConsumedQuantity;

    this.resetWorkOrderLineStatus(workOrderLineCompleteTransaction);
  }

  resetWorkOrderLineStatus(workOrderLineCompleteTransaction: WorkOrderLineCompleteTransaction) {
    const returnedMaterialRequestQuantity: number = workOrderLineCompleteTransaction.returnMaterialRequests
      .map(returnMaterialRequest => returnMaterialRequest.quantity)
      .reduce((a, b) => a + b, 0);

    if (
      workOrderLineCompleteTransaction.workOrderLine.deliveredQuantity ===
      +workOrderLineCompleteTransaction.adjustedConsumedQuantity +
        +workOrderLineCompleteTransaction.scrappedQuantity +
        +returnedMaterialRequestQuantity
    ) {
      this.mapOfWorkOrderLineStatus[workOrderLineCompleteTransaction.workOrderLine.id] = true;
    } else {
      this.mapOfWorkOrderLineStatus[workOrderLineCompleteTransaction.workOrderLine.id] = false;
    }
  }

  isWorkOrderReadyForComplete(): boolean {
    if (this.currentWorkOrder === undefined) {
      return false;
    }
    return this.currentWorkOrder.workOrderLines.filter(
      workOrderLine => this.mapOfWorkOrderLineStatus[workOrderLine.id] === false,
    ).length > 0
      ? false
      : true;
  }

  addKPIInfo() {
    sessionStorage.setItem('workOrderCompleteTransaction', JSON.stringify(this.workOrderCompleteTransaction));
    this.router.navigateByUrl(`/work-order/work-order/complete/kpi?id=${this.currentWorkOrder.id}`);
  }
  confirmWorkOrderComplete() {
    sessionStorage.setItem('workOrderCompleteTransaction', JSON.stringify(this.workOrderCompleteTransaction));
    this.router.navigateByUrl(`/work-order/work-order/complete/confirm?id=${this.currentWorkOrder.id}`);
  }
}