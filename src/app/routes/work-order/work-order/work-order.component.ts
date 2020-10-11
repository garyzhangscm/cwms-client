import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { WorkOrder } from '../models/work-order';
import { WorkOrderService } from '../services/work-order.service';

import { formatDate } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PutawayConfigurationService } from '../../inbound/services/putaway-configuration.service';
import { Inventory } from '../../inventory/models/inventory';
import { InventoryService } from '../../inventory/services/inventory.service';
import { PickService } from '../../outbound/services/pick.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WorkOrderKpi } from '../models/work-order-kpi';
import { WorkOrderKpiTransaction } from '../models/work-order-kpi-transaction';
import { WorkOrderStatus } from '../models/work-order-status.enum';
import { ProductionLineService } from '../services/production-line.service';

@Component({
  selector: 'app-work-order-work-order',
  templateUrl: './work-order.component.html',
  styleUrls: ['./work-order.component.less'],
})
export class WorkOrderWorkOrderComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private modalService: NzModalService,
    private workOrderService: WorkOrderService,
    private messageService: NzMessageService,
    private productionLineService: ProductionLineService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private pickService: PickService,
    private putawayConfigurationService: PutawayConfigurationService,
    private inventoryService: InventoryService,
    private locationService: LocationService,
  ) {}
  workOrderStatus = WorkOrderStatus;
  // Form related data and functions
  searchForm!: FormGroup;
  searching = false;
  searchResult = '';
  allocating = false;
  unpickForm!: FormGroup;
  unpickModal!: NzModalRef;
  currentInventory!: Inventory;
  manualPutawayModal!: NzModalRef;

  availableProductionLines: Array<{ label: string; value: string }> = [];

  // Table data for display
  listOfAllWorkOrder: WorkOrder[] = [];
  listOfDisplayWorkOrder: WorkOrder[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  // checkbox - select all
  allChecked = false;
  indeterminate = false;
  isAllDisplayDataChecked = false;
  // list of checked checkbox
  mapOfCheckedId: { [key: string]: boolean } = {};
  // list of expanded row
  mapOfExpandedId: { [key: string]: boolean } = {};
  // list of record with allocation in process
  mapOfAllocationInProcessId: { [key: string]: boolean } = {};

  // list of record with printing in process
  mapOfPrintingInProcessId: { [key: string]: boolean } = {};

  mapOfDeliveredInventory: { [key: string]: Inventory[] } = {};
  mapOfProducedInventory: { [key: string]: Inventory[] } = {};
  mapOfReturnedInventory: { [key: string]: Inventory[] } = {};
  mapOfProducedByProduct: { [key: string]: Inventory[] } = {};
  mapOfKPIs: { [key: string]: WorkOrderKpi[] } = {};
  mapOfKPITransactions: { [key: string]: WorkOrderKpiTransaction[] } = {};

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.work-order.work-order'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      item: [null],
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.number) {
        this.searchForm.controls.number.setValue(params.number);
        this.search();
      }
    });
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllWorkOrder = [];
    this.listOfDisplayWorkOrder = [];
  }

  search(id?: number): void {
    this.searching = true;
    this.searchResult = '';
    if (id) {
      this.workOrderService.getWorkOrder(id).subscribe(
        workOrderRes => {
          this.listOfAllWorkOrder = this.calculateWorkOrderLineTotalQuantities([workOrderRes]);
          this.listOfDisplayWorkOrder = this.listOfAllWorkOrder;
          this.searching = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: 1,
          });
        },
        () => {
          this.searching = false;
          this.searchResult = '';
        },
      );
    } else {
      this.workOrderService
        .getWorkOrders(this.searchForm.controls.number.value, this.searchForm.controls.item.value)
        .subscribe(
          workOrderRes => {
            this.listOfAllWorkOrder = this.calculateWorkOrderLineTotalQuantities(workOrderRes);
            this.listOfDisplayWorkOrder = this.listOfAllWorkOrder;
            this.searching = false;
            this.searchResult = this.i18n.fanyi('search_result_analysis', {
              currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
              rowCount: workOrderRes.length,
            });
          },
          () => {
            this.searching = false;
            this.searchResult = '';
          },
        );
    }
    this.loadAvailableProductionLine();
  }

  calculateWorkOrderLineTotalQuantities(workOrders: WorkOrder[]): WorkOrder[] {
    workOrders.forEach(workOrder => {
      // init all the quantity to 0;
      this.calculateWorkOrderLineTotalQuantity(workOrder);
    });

    return workOrders;
  }

  calculateWorkOrderLineTotalQuantity(workOrder: WorkOrder): WorkOrder {
    // init all the quantity to 0;
    workOrder.totalLineExpectedQuantity = 0;
    workOrder.totalLineOpenQuantity = 0;
    workOrder.totalLineInprocessQuantity = 0;
    workOrder.totalLineDeliveredQuantity = 0;
    workOrder.totalLineConsumedQuantity = 0;
    workOrder.workOrderLines.forEach(workOrderLine => {
      workOrder.totalLineExpectedQuantity = workOrder.totalLineExpectedQuantity! + workOrderLine.expectedQuantity!;
      workOrder.totalLineOpenQuantity = workOrder.totalLineOpenQuantity! + workOrderLine.openQuantity!;
      workOrder.totalLineInprocessQuantity = workOrder.totalLineInprocessQuantity! + workOrderLine.inprocessQuantity!;
      workOrder.totalLineDeliveredQuantity = workOrder.totalLineDeliveredQuantity! + workOrderLine.deliveredQuantity!;
      workOrder.totalLineConsumedQuantity = workOrder.totalLineConsumedQuantity! + workOrderLine.consumedQuantity!;
    });
    return workOrder;
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayWorkOrder.every(item => this.mapOfCheckedId[item.id!]);
    this.indeterminate =
      this.listOfDisplayWorkOrder.some(item => this.mapOfCheckedId[item.id!]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayWorkOrder.forEach(item => (this.mapOfCheckedId[item.id!] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;

    // sort data
    
  }

  removeSelectedWorkOrders(): void {
    // make sure we have at least one checkbox checked
    const selectedWorkOrders = this.getSelectedWorkOrders();
    if (selectedWorkOrders.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.workOrderService.removeWorkOrders(selectedWorkOrders).subscribe(res => {
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedWorkOrders(): WorkOrder[] {
    const selectedWorkOrders: WorkOrder[] = [];
    this.listOfAllWorkOrder.forEach((workOrder: WorkOrder) => {
      if (this.mapOfCheckedId[workOrder.id!] === true) {
        selectedWorkOrders.push(workOrder);
      }
    });
    return selectedWorkOrders;
  }

  loadAvailableProductionLine(): void {
    this.availableProductionLines = [];
    // load all available production lines
    this.productionLineService.getAvailableProductionLines().subscribe(productionLineRes => {
      productionLineRes.forEach(productionLine =>
        this.availableProductionLines.push({ label: productionLine.name, value: productionLine.id.toString() }),
      );
    });
  }
  allocateWorkOrder(workOrder: WorkOrder): void {
    this.mapOfAllocationInProcessId[workOrder.id!] = true;
    this.workOrderService.allocateWorkOrder(workOrder).subscribe(workOrderRes => {
      this.messageService.success(this.i18n.fanyi('message.allocate.success'));
      this.mapOfAllocationInProcessId[workOrder.id!] = false;
      this.search();
    });
  }
  workOrderHasAnyAction(workOrder: WorkOrder): boolean {
    return (
      this.isWorkOrderChangable(workOrder) ||
      this.isWorkOrderAllocatable(workOrder) ||
      this.isWorkOrderReadyForProduce(workOrder) ||
      this.isWorkOrderReadyForComplete(workOrder)
    );
  }
  isWorkOrderPickable(workOrder: WorkOrder): boolean {
    return workOrder.status === WorkOrderStatus.INPROCESS;
  }
  isInventoryUnpickable(workOrder: WorkOrder, inventory: Inventory): boolean {
    return workOrder.status === WorkOrderStatus.INPROCESS;
  }
  changeProductionLine(workOrder: WorkOrder, productionLineId: number): void {
    this.workOrderService.changeProductionLine(workOrder, productionLineId).subscribe(workOrderRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }
  isWorkOrderChangable(workOrder: WorkOrder): boolean {
    return (
      workOrder.status !== WorkOrderStatus.COMPLETED &&
      workOrder.status !== WorkOrderStatus.CANCELLED &&
      workOrder.status !== WorkOrderStatus.CLOSED
    );
  }
  isWorkOrderAllocatable(workOrder: WorkOrder): boolean {
    return workOrder.productionLine != null && workOrder.totalLineOpenQuantity! > 0;
  }
  // The user is allowed to change the production line only when
  // the work order is in pending status
  isProductionLineChangable(workOrder: WorkOrder): boolean {
    return workOrder.status === WorkOrderStatus.PENDING;
  }

  printPickSheets(workOrder: WorkOrder): void {
    this.mapOfPrintingInProcessId[workOrder.id!] = true;
    this.workOrderService.printWorkOrderPickSheet(workOrder);
    // purposely to show the 'loading' status of the print button
    // for at least 1 second. The above printWorkOrderPickSheet will
    // return immediately but the print job(or print preview page)
    // will start with some delay. During the delay, we will
    // display the 'print' button as 'Loading' status
    setTimeout(() => {
      this.mapOfPrintingInProcessId[workOrder.id!] = false;
    }, 1000);
  }
  confirmPicks(workOrder: WorkOrder): void {
    this.router.navigateByUrl(`/outbound/pick/confirm?type=workOrder&id=${workOrder.id}`);
  }

  isWorkOrderReadyForComplete(workOrder: WorkOrder): boolean {
    return workOrder.status === WorkOrderStatus.INPROCESS || workOrder.status === WorkOrderStatus.PENDING;
  }
  completeWorkOrder(workOrder: WorkOrder): void {
    this.router.navigateByUrl(`/work-order/work-order/complete?id=${workOrder.id}`);
  }

  isWorkOrderReadyForProduce(workOrder: WorkOrder): boolean {
    return (
      workOrder.productionLine != null &&
      workOrder.totalLineInprocessQuantity! > 0 &&
      workOrder.totalLineDeliveredQuantity! - workOrder.totalLineConsumedQuantity! > 0 &&
      workOrder.status === WorkOrderStatus.INPROCESS
    );
  }
  produceFromWorkOrder(workOrder: WorkOrder): void {
    this.router.navigateByUrl(`/work-order/work-order/produce?id=${workOrder.id}`);
  }

  showDeliveredInventory(workOrder: WorkOrder): void {
    this.workOrderService.getDeliveredInventory(workOrder).subscribe(deliveredInventoryRes => {
      this.mapOfDeliveredInventory[workOrder.id!] = [...deliveredInventoryRes];
    });
  }

  showProducedByProduct(workOrder: WorkOrder): void {
    this.workOrderService.getProducedByProduct(workOrder).subscribe(producedByProductRes => {
      this.mapOfProducedByProduct[workOrder.id!] = [...producedByProductRes];
    });
  }

  showProducedInventory(workOrder: WorkOrder): void {
    this.workOrderService.getProducedInventory(workOrder).subscribe(returnedInventoryRes => {
      this.mapOfProducedInventory[workOrder.id!] = [...returnedInventoryRes];
    });
  }

  showReturnedInventory(workOrder: WorkOrder): void {
    this.workOrderService.getReturnedInventory(workOrder).subscribe(producedInventoryRes => {
      this.mapOfReturnedInventory[workOrder.id!] = [...producedInventoryRes];
    });
  }

  showKPIs(workOrder: WorkOrder): void {
    this.workOrderService.getKPIs(workOrder).subscribe(workOrderKPIs => {
      this.mapOfKPIs[workOrder.id!] = [...workOrderKPIs];
    });
  }

  showKPITransactions(workOrder: WorkOrder): void {
    this.workOrderService.getKPITransactions(workOrder).subscribe(workOrderKPITransactions => {
      workOrderKPITransactions.forEach(transaction => {
        console.log(
          `transaction: ${transaction.amount}, type: ${transaction.type}, createdBy: ${transaction.createdTime}`,
        );
        console.log(`transaction: ${JSON.stringify(transaction)}`);
      });
      this.mapOfKPITransactions[workOrder.id!] = [...workOrderKPITransactions];
    });
  }

  showWorkOrderDetails(workOrder: WorkOrder): void {
    // When we expand the details for the order, load the picks and short allocation from the server
    if (this.mapOfExpandedId[workOrder.id!] === true) {
      this.showDeliveredInventory(workOrder);
      this.showProducedInventory(workOrder);
      this.showProducedByProduct(workOrder);
      this.showReturnedInventory(workOrder);
      this.showKPITransactions(workOrder);
      this.showKPIs(workOrder);
    }
  }

  getConsumedQuantity(workOrder: WorkOrder, itemId: number): number {
    let consumedQuantity = 0;
    workOrder.workOrderLines
      .filter(workOrderLine => workOrderLine.itemId === itemId)
      .forEach(workOrderLine => (consumedQuantity = consumedQuantity + workOrderLine.consumedQuantity!));
    return consumedQuantity;
  }

  getDeliveryQuantity(workOrder: WorkOrder, itemId: number): number {
    let deliveredQuantity = 0;
    workOrder.workOrderLines
      .filter(workOrderLine => workOrderLine.itemId === itemId)
      .forEach(workOrderLine => (deliveredQuantity = deliveredQuantity + workOrderLine.deliveredQuantity!));
    return deliveredQuantity;
  }

  openUnpickModal(
    workOrder: WorkOrder,
    inventory: Inventory,
    tplUnpickModalTitle: TemplateRef<{}>,
    tplUnpickModalContent: TemplateRef<{}>,
  ): void {
    const deliveredQuantity = this.getDeliveryQuantity(workOrder, inventory.item!.id!);
    const consumedQuantity = this.getConsumedQuantity(workOrder, inventory.item!.id!);

    this.unpickForm = this.fb.group({
      deliveredQuantity: new FormControl({ value: deliveredQuantity, disabled: true }),
      consumedQuantity: new FormControl({ value: consumedQuantity, disabled: true }),
      overrideConsumedQuantity: [null],
      lpn: new FormControl({ value: inventory.lpn, disabled: true }),
      itemNumber: new FormControl({ value: inventory.item!.name, disabled: true }),
      itemDescription: new FormControl({ value: inventory.item!.description, disabled: true }),
      inventoryStatus: new FormControl({ value: inventory.inventoryStatus!.name, disabled: true }),
      itemPackageType: new FormControl({ value: inventory.itemPackageType!.name, disabled: true }),
      quantity: new FormControl({ value: inventory.quantity, disabled: true }),
      locationName: new FormControl({ value: inventory.location!.name, disabled: true }),
      destinationLocation: [null],
      immediateMove: [null],
    });

    // Load the location
    this.unpickModal = this.modalService.create({
      nzTitle: tplUnpickModalTitle,
      nzContent: tplUnpickModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.unpickModal.destroy();
        // this.refreshReceiptResults();
      },
      nzOnOk: () => {
        this.unpickInventory(
          workOrder,
          inventory,
          this.unpickForm.controls.destinationLocation.value,
          this.unpickForm.controls.immediateMove.value,
          this.unpickForm.controls.overrideConsumedQuantity.value,
          this.unpickForm.controls.consumedQuantity.value,
        );
      },
      nzWidth: 1000,
    });
  }

  unpickInventory(
    workOrder: WorkOrder,
    inventory: Inventory,
    destinationLocation: string,
    immediateMove: boolean,
    overrideConsumedQuantity: boolean,
    consumedQuantity: number,
  ): void {
    console.log(
      `Start to unpick ${JSON.stringify(inventory)} to ${destinationLocation}, immediateMove: ${immediateMove} \n
      overrideConsumedQuantity: ${overrideConsumedQuantity}, consumedQuantity: ${consumedQuantity}`,
    );
    this.workOrderService
      .unpick(workOrder, inventory, overrideConsumedQuantity, consumedQuantity, destinationLocation, immediateMove)
      .subscribe(res => {
        console.log(`unpick is done`);
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        // refresh the picked inventory
        this.search(workOrder.id);
      });
  }

  inventoryReadyForPutaway(workOrder: WorkOrder, inventory: Inventory): boolean {
    if (workOrder.productionLine === null || workOrder.productionLine === undefined) {
      return false;
    }
    return inventory.location!.id === workOrder.productionLine.outboundStageLocationId;
  }

  allocateLocation(workOrder: WorkOrder, inventory: Inventory): void {
    this.putawayConfigurationService.allocateLocation(inventory).subscribe(allocatedInventory => {
      this.messageService.success(this.i18n.fanyi('message.allocate-location.success'));
      inventory.inventoryMovements = allocatedInventory.inventoryMovements;
      this.showWorkOrderDetails(workOrder);
    });
  }
  reallocateLocation(workOrder: WorkOrder, inventory: Inventory): void {
    this.putawayConfigurationService.reallocateLocation(inventory).subscribe(allocatedInventory => {
      this.messageService.success(this.i18n.fanyi('message.allocate-location.success'));
      inventory.inventoryMovements = allocatedInventory.inventoryMovements;
      this.showWorkOrderDetails(workOrder);
    });
  }

  confirmPutaway(workOrder: WorkOrder, index: number, inventory: Inventory): void {
    console.log(`confirm putaway with movement index ${index}, inventory: ${inventory.lpn}`);
    console.log(
      `confirm putaway with movement index ${inventory.inventoryMovements![index].location.name}, inventory: ${inventory.lpn}`,
    );

    this.inventoryService.move(inventory, inventory.inventoryMovements![index].location).subscribe(() => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.showWorkOrderDetails(workOrder);
    });
  }

  openManualPutawayModal(
    workOrder: WorkOrder,
    inventory: Inventory,
    tplManualPutawayModalTitle: TemplateRef<{}>,
    tplManualPutawayModalContent: TemplateRef<{}>,
  ): void {
    this.currentInventory = inventory;
    // Load the location
    this.manualPutawayModal = this.modalService.create({
      nzTitle: tplManualPutawayModalTitle,
      nzContent: tplManualPutawayModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.manualPutawayModal.destroy();
        // this.refreshReceiptResults();
      },
      nzOnOk: () => {
        this.manualPutawayInventory(workOrder, this.currentInventory);
      },
      nzWidth: 1000,
    });
  }
  manualPutawayInventory(workOrder: WorkOrder, inventory: Inventory): void {
    if (inventory.locationName) {
      // Location name is setup
      // Let's find the location by name and assign it to the inventory
      // that will be received
      console.log(`Will setup received inventory's location to ${inventory.locationName}`);

      this.locationService.getLocations(undefined, undefined, inventory.locationName).subscribe(locations => {
        // There should be only one location returned.
        // Move the inventory to the location
        this.inventoryService.move(inventory, locations[0]).subscribe(() => {
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          this.showWorkOrderDetails(workOrder);
          // this.refreshReceiptResults();
        });
      });
    }
  }

  changeWorkOrderLine(workOrder: WorkOrder): void {
    this.router.navigateByUrl(`/work-order/work-order/line/maintenance?id=${workOrder.id}`);
  }
}
