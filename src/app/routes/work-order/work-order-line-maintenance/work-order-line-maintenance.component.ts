import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { InventoryStatus } from '../../inventory/models/inventory-status';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ItemService } from '../../inventory/services/item.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { KpiMeasurement } from '../models/kpi-measurement.enum';
import { WorkOrder } from '../models/work-order';
import { WorkOrderKpiTransaction } from '../models/work-order-kpi-transaction';
import { WorkOrderKpiTransactionType } from '../models/work-order-kpi-transaction-type.enum';
import { WorkOrderLine } from '../models/work-order-line';
import { WorkOrderService } from '../services/work-order.service';

@Component({
  selector: 'app-work-order-work-order-line-maintenance',
  templateUrl: './work-order-line-maintenance.component.html',
})
export class WorkOrderWorkOrderLineMaintenanceComponent implements OnInit {
  currentWorkOrder!: WorkOrder;

  pageTitle = '';
  stepIndex = 0;
  savingInProcess = false;

  validItemNames: string[] = [];
  mapOfNewLineExpectedQuantity: { [key: string]: number } = {};
  availableInventoryStatuses: InventoryStatus[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private router: Router,
    private workOrderService: WorkOrderService,
    private messageService: NzMessageService,
    private itemService: ItemService,
    private inventoryStatusService: InventoryStatusService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.work-order.line.maintenance');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.work-order.line.maintenance'));

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        this.workOrderService.getWorkOrder(params.id).subscribe(workOrderRes => {
          this.currentWorkOrder = workOrderRes;
          workOrderRes.workOrderLines.forEach(workOrderLine => {
            // Default to the original quantity. So by default, we won't change the
            // work order line quantity
            this.mapOfNewLineExpectedQuantity[workOrderLine.number!] = workOrderLine.expectedQuantity!;
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

  initialItemList(): void {
    this.validItemNames = [];
    this.itemService.getItems().subscribe(itemsRes => {
      itemsRes.forEach(item => {
        this.validItemNames.push(item.name);
      });
    });
  }

  removeWorkOrderLine(workOrderLine: WorkOrderLine): void {
    this.currentWorkOrder.workOrderLines = this.currentWorkOrder.workOrderLines.filter(
      existingWorkOrderLine => existingWorkOrderLine.number !== workOrderLine.number,
    );
  }
  addNewWorkOrderLine(): void {
    this.currentWorkOrder.workOrderLines = [...this.currentWorkOrder.workOrderLines, this.getEmptyWorkOrderLine()];
  }
  getEmptyWorkOrderLine(): WorkOrderLine {
    return {
      id: undefined,
      number: this.getNextWorkOrderLineNumber(),
      itemId: undefined,
      item: {
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,
        name: '',
        description: '',
        itemPackageTypes: [],

        client: undefined,
        itemFamily: undefined,
        unitCost: undefined,
        allowCartonization: undefined,

        allowAllocationByLPN: undefined,
        allocationRoundUpStrategyType: undefined,

        allocationRoundUpStrategyValue: undefined,

        trackingVolumeFlag: undefined,
        trackingLotNumberFlag: undefined,
        trackingManufactureDateFlag: undefined,
        shelfLifeDays: undefined,
        trackingExpirationDateFlag: undefined,
      },
      workOrderLineSpareParts: [],

      expectedQuantity: 0,
      openQuantity: 0,
      inprocessQuantity: 0,
      deliveredQuantity: 0,
      consumedQuantity: 0,
      scrappedQuantity: 0,
      returnedQuantity: 0,

      inventoryStatusId: undefined,
      inventoryStatus: undefined,

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
    return `${maxLineNumber  }`;
  }

  itemNameChanged(event: Event, workOrderLine: WorkOrderLine): void {
    this.itemService.getItems((event.target as HTMLInputElement).value).subscribe(itemsRes => {
      itemsRes.forEach(item => {
        workOrderLine.itemId = item.id;
        workOrderLine.item = item;
      });
    });
  }

  inventoryStatusChange(newInventoryStatusName: string, workOrderLine: WorkOrderLine): void {
    this.availableInventoryStatuses.forEach(inventoryStatus => {
      if (inventoryStatus.name === newInventoryStatusName) {
        workOrderLine.inventoryStatus = inventoryStatus;
        workOrderLine.inventoryStatusId = inventoryStatus.id;
      }
    });
  }
  saveCurrentWorkOrderResults(): void {
    this.savingInProcess = true;
    this.currentWorkOrder.workOrderLines.forEach(workOrderLine => {
      workOrderLine.expectedQuantity = this.mapOfNewLineExpectedQuantity[workOrderLine.number!];
    });
    this.workOrderService.modifyWorkOrderLine(this.currentWorkOrder).subscribe(
      workOrderRes => {
        this.messageService.success(this.i18n.fanyi('message.work-order.line.modify-success'));
        setTimeout(() => {
          this.savingInProcess = false;
          this.router.navigateByUrl(`/work-order/work-order?number=${this.currentWorkOrder.number}`);
        }, 500);
      },
      () => {
        this.messageService.success(this.i18n.fanyi('message.work-order.line.modify-error'));
      },
      () => (this.savingInProcess = false),
    );
  }

  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
  }
}
