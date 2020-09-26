import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { WorkOrder } from '../models/work-order';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { WorkOrderService } from '../services/work-order.service';
import { NzMessageService } from 'ng-zorro-antd';
import { ItemService } from '../../inventory/services/item.service';
import { WorkOrderKpiTransaction } from '../models/work-order-kpi-transaction';
import { WorkOrderKpiTransactionType } from '../models/work-order-kpi-transaction-type.enum';
import { KpiMeasurement } from '../models/kpi-measurement.enum';
import { WorkOrderLine } from '../models/work-order-line';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';

@Component({
  selector: 'app-work-order-work-order-line-maintenance',
  templateUrl: './work-order-line-maintenance.component.html',
})
export class WorkOrderWorkOrderLineMaintenanceComponent implements OnInit {
  currentWorkOrder: WorkOrder;

  pageTitle: string;
  stepIndex: number;
  savingInProcess = false;

  validItemNames: string[];
  mapOfNewLineExpectedQuantity: { [key: string]: number } = {};
  availableInventoryStatuses: InventoryStatus[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private i18n: I18NService,
    private titleService: TitleService,
    private router: Router,
    private workOrderService: WorkOrderService,
    private messageService: NzMessageService,
    private itemService: ItemService,
    private inventoryStatusService: InventoryStatusService,
    private warehouseService: WarehouseService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.work-order.line.maintenance');
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('page.work-order.line.maintenance'));

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        this.workOrderService.getWorkOrder(params.id).subscribe(workOrderRes => {
          this.currentWorkOrder = workOrderRes;
          workOrderRes.workOrderLines.forEach(workOrderLine => {
            // Default to the original quantity. So by default, we won't change the
            // work order line quantity
            this.mapOfNewLineExpectedQuantity[workOrderLine.number] = workOrderLine.expectedQuantity;
          });
        });
      }
    });
    this.stepIndex = 0;

    this.initialItemList();

    this.inventoryStatusService
      .loadInventoryStatuses()
      .subscribe(inventoryStatuses => (this.availableInventoryStatuses = inventoryStatuses));
  }

  initialItemList() {
    this.validItemNames = [];
    this.itemService.getItems().subscribe(itemsRes => {
      itemsRes.forEach(item => {
        this.validItemNames.push(item.name);
      });
    });
  }

  removeWorkOrderLine(workOrderLine: WorkOrderLine) {
    this.currentWorkOrder.workOrderLines = this.currentWorkOrder.workOrderLines.filter(
      existingWorkOrderLine => existingWorkOrderLine.number !== workOrderLine.number,
    );
  }
  addNewWorkOrderLine() {
    this.currentWorkOrder.workOrderLines = [...this.currentWorkOrder.workOrderLines, this.getEmptyWorkOrderLine()];
  }
  getEmptyWorkOrderLine(): WorkOrderLine {
    return {
      id: null,
      number: this.getNextWorkOrderLineNumber(),
      itemId: null,
      item: {
        id: null,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        name: '',
        description: '',
        itemPackageTypes: [],

        client: null,
        itemFamily: null,
        unitCost: null,
        allowCartonization: null,

        allowAllocationByLPN: null,
        allocationRoundUpStrategyType: null,

        allocationRoundUpStrategyValue: null,

        trackingVolumeFlag: null,
        trackingLotNumberFlag: null,
        trackingManufactureDateFlag: null,
        shelfLifeDays: null,
        trackingExpirationDateFlag: null,
      },

      expectedQuantity: 0,
      openQuantity: 0,
      inprocessQuantity: 0,
      deliveredQuantity: 0,
      consumedQuantity: 0,
      scrappedQuantity: 0,
      returnedQuantity: 0,

      inventoryStatusId: null,
      inventoryStatus: null,

      picks: [],
      shortAllocations: [],
    };
  }
  getNextWorkOrderLineNumber(): string {
    let maxLineNumber = 0;
    this.currentWorkOrder.workOrderLines.forEach(workOrderLine => {
      if (!isNaN(Number(workOrderLine.number)) && maxLineNumber <= Number(workOrderLine.number)) {
        maxLineNumber = Number(workOrderLine.number) + 1;
      }
    });
    return maxLineNumber + '';
  }

  itemNameChanged(itemName: string, workOrderLine: WorkOrderLine) {
    this.itemService.getItems(itemName).subscribe(itemsRes => {
      itemsRes.forEach(item => {
        workOrderLine.itemId = item.id;
        workOrderLine.item = item;
      });
    });
  }

  inventoryStatusChange(newInventoryStatusName, workOrderLine: WorkOrderLine) {
    this.availableInventoryStatuses.forEach(inventoryStatus => {
      if (inventoryStatus.name === newInventoryStatusName) {
        workOrderLine.inventoryStatus = inventoryStatus;
        workOrderLine.inventoryStatusId = inventoryStatus.id;
      }
    });
  }
  saveCurrentWorkOrderResults() {
    this.savingInProcess = true;
    this.currentWorkOrder.workOrderLines.forEach(workOrderLine => {
      workOrderLine.expectedQuantity = this.mapOfNewLineExpectedQuantity[workOrderLine.number];
    });
    this.workOrderService.modifyWorkOrderLine(this.currentWorkOrder).subscribe(
      workOrderRes => {
        this.messageService.success(this.i18n.fanyi('message.work-order.line.modify-success'));
        setTimeout(() => {
          this.savingInProcess = false;
          this.router.navigateByUrl(`/work-order/work-order?number=${this.currentWorkOrder.number}`);
        }, 2500);
      },
      () => {
        this.messageService.success(this.i18n.fanyi('message.work-order.line.modify-error'));
      },
      () => (this.savingInProcess = false),
    );
  }

  previousStep() {
    this.stepIndex -= 1;
  }
  nextStep() {
    this.stepIndex += 1;
  }
}
