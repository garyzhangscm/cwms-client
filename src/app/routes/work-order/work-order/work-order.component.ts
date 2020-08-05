import { Component, OnInit, TemplateRef } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { I18NService } from '@core';
import { NzModalService, NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { WorkOrderService } from '../services/work-order.service';
import { WorkOrder } from '../models/work-order';

import { ProductionLineService } from '../services/production-line.service';
import { WorkOrderStatus } from '../models/work-order-status.enum';
import { Router, ActivatedRoute } from '@angular/router';
import { PickService } from '../../outbound/services/pick.service';
import { Inventory } from '../../inventory/models/inventory';
import { PutawayConfigurationService } from '../../inbound/services/putaway-configuration.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { LocationService } from '../../warehouse-layout/services/location.service';

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
  searchForm: FormGroup;
  searching = false;
  allocating = false;
  unpickForm: FormGroup;
  unpickModal: NzModalRef;
  currentInventory: Inventory;
  manualPutawayModal: NzModalRef;

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

  ngOnInit() {
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
    if (id) {
      this.workOrderService.getWorkOrder(id).subscribe(workOrderRes => {
        this.listOfAllWorkOrder = this.calculateWorkOrderLineTotalQuantities([workOrderRes]);
        this.listOfDisplayWorkOrder = this.listOfAllWorkOrder;
        this.searching = false;
      });
    } else {
      this.workOrderService
        .getWorkOrders(this.searchForm.controls.number.value, this.searchForm.controls.item.value)
        .subscribe(workOrderRes => {
          this.listOfAllWorkOrder = this.calculateWorkOrderLineTotalQuantities(workOrderRes);
          this.listOfDisplayWorkOrder = this.listOfAllWorkOrder;
          this.searching = false;
        });
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
      workOrder.totalLineExpectedQuantity = workOrder.totalLineExpectedQuantity + workOrderLine.expectedQuantity;
      workOrder.totalLineOpenQuantity = workOrder.totalLineOpenQuantity + workOrderLine.openQuantity;
      workOrder.totalLineInprocessQuantity = workOrder.totalLineInprocessQuantity + workOrderLine.inprocessQuantity;
      workOrder.totalLineDeliveredQuantity = workOrder.totalLineDeliveredQuantity + workOrderLine.deliveredQuantity;
      workOrder.totalLineConsumedQuantity = workOrder.totalLineConsumedQuantity + workOrderLine.consumedQuantity;
    });
    return workOrder;
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayWorkOrder.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayWorkOrder.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayWorkOrder.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;

    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayWorkOrder = this.listOfAllWorkOrder.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayWorkOrder = this.listOfAllWorkOrder;
    }
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
      if (this.mapOfCheckedId[workOrder.id] === true) {
        selectedWorkOrders.push(workOrder);
      }
    });
    return selectedWorkOrders;
  }

  loadAvailableProductionLine() {
    this.availableProductionLines = [];
    // load all available production lines
    this.productionLineService.getAvailableProductionLines().subscribe(productionLineRes => {
      productionLineRes.forEach(productionLine =>
        this.availableProductionLines.push({ label: productionLine.name, value: productionLine.id.toString() }),
      );
    });
  }
  allocateWorkOrder(workOrder: WorkOrder) {
    this.mapOfAllocationInProcessId[workOrder.id] = true;
    this.workOrderService.allocateWorkOrder(workOrder).subscribe(workOrderRes => {
      this.messageService.success(this.i18n.fanyi('message.allocate.success'));
      this.mapOfAllocationInProcessId[workOrder.id] = false;
      this.search();
    });
  }
  isWorkOrderPickable(workOrder: WorkOrder): boolean {
    return workOrder.status === WorkOrderStatus.INPROCESS;
  }
  isInventoryUnpickable(workOrder: WorkOrder, inventory: Inventory): boolean {
    return workOrder.status === WorkOrderStatus.INPROCESS;
  }
  changeProductionLine(workOrder: WorkOrder, productionLineId: number) {
    this.workOrderService.changeProductionLine(workOrder, productionLineId).subscribe(workOrderRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }
  isWorkOrderAllocatable(workOrder: WorkOrder): boolean {
    return workOrder.productionLine != null && workOrder.totalLineOpenQuantity > 0;
  }
  // The user is allowed to change the production line only when
  // the work order is in pending status
  isProductionLineChangable(workOrder: WorkOrder): boolean {
    return workOrder.status === WorkOrderStatus.PENDING;
  }

  printPickSheets(workOrder: WorkOrder) {
    this.mapOfPrintingInProcessId[workOrder.id] = true;
    this.workOrderService.printWorkOrderPickSheet(workOrder);
    // purposely to show the 'loading' status of the print button
    // for at least 1 second. The above printWorkOrderPickSheet will
    // return immediately but the print job(or print preview page)
    // will start with some delay. During the delay, we will
    // display the 'print' button as 'Loading' status
    setTimeout(() => {
      this.mapOfPrintingInProcessId[workOrder.id] = false;
    }, 1000);
  }
  confirmPicks(workOrder: WorkOrder) {
    this.router.navigateByUrl(`/outbound/pick/confirm?type=workOrder&id=${workOrder.id}`);
  }

  isWorkOrderReadyForComplete(workOrder: WorkOrder): boolean {
    return workOrder.status === WorkOrderStatus.INPROCESS;
  }
  completeWorkOrder(workOrder: WorkOrder) {
    this.router.navigateByUrl(`/work-order/work-order/complete?id=${workOrder.id}`);
  }

  isWorkOrderReadyForProduce(workOrder: WorkOrder): boolean {
    return (
      workOrder.productionLine != null &&
      workOrder.totalLineInprocessQuantity > 0 &&
      workOrder.totalLineDeliveredQuantity - workOrder.totalLineConsumedQuantity > 0 &&
      workOrder.status === WorkOrderStatus.INPROCESS
    );
  }
  produceFromWorkOrder(workOrder: WorkOrder) {
    this.router.navigateByUrl(`/work-order/work-order/produce?id=${workOrder.id}`);
  }

  showDeliveredInventory(workOrder: WorkOrder) {
    this.workOrderService.getDeliveredInventory(workOrder).subscribe(deliveredInventoryRes => {
      this.mapOfDeliveredInventory[workOrder.id] = [...deliveredInventoryRes];
    });
  }

  showProducedInventory(workOrder: WorkOrder) {
    this.workOrderService.getProducedInventory(workOrder).subscribe(returnedInventoryRes => {
      this.mapOfProducedInventory[workOrder.id] = [...returnedInventoryRes];
    });
  }

  showReturnedInventory(workOrder: WorkOrder) {
    this.workOrderService.getReturnedInventory(workOrder).subscribe(producedInventoryRes => {
      this.mapOfReturnedInventory[workOrder.id] = [...producedInventoryRes];
    });
  }

  showWorkOrderDetails(workOrder: WorkOrder) {
    // When we expand the details for the order, load the picks and short allocation from the server
    if (this.mapOfExpandedId[workOrder.id] === true) {
      this.showDeliveredInventory(workOrder);
      this.showProducedInventory(workOrder);
      this.showReturnedInventory(workOrder);
    }
  }

  getConsumedQuantity(workOrder: WorkOrder, itemId: number): number {
    let consumedQuantity = 0;
    workOrder.workOrderLines
      .filter(workOrderLine => workOrderLine.itemId === itemId)
      .forEach(workOrderLine => (consumedQuantity = consumedQuantity + workOrderLine.consumedQuantity));
    return consumedQuantity;
  }

  getDeliveryQuantity(workOrder: WorkOrder, itemId: number): number {
    let deliveredQuantity = 0;
    workOrder.workOrderLines
      .filter(workOrderLine => workOrderLine.itemId === itemId)
      .forEach(workOrderLine => (deliveredQuantity = deliveredQuantity + workOrderLine.deliveredQuantity));
    return deliveredQuantity;
  }

  openUnpickModal(
    workOrder: WorkOrder,
    inventory: Inventory,
    tplUnpickModalTitle: TemplateRef<{}>,
    tplUnpickModalContent: TemplateRef<{}>,
  ) {
    const deliveredQuantity = this.getDeliveryQuantity(workOrder, inventory.item.id);
    const consumedQuantity = this.getConsumedQuantity(workOrder, inventory.item.id);

    this.unpickForm = this.fb.group({
      deliveredQuantity: new FormControl({ value: deliveredQuantity, disabled: true }),
      consumedQuantity: new FormControl({ value: consumedQuantity, disabled: true }),
      overrideConsumedQuantity: [null],
      lpn: new FormControl({ value: inventory.lpn, disabled: true }),
      itemNumber: new FormControl({ value: inventory.item.name, disabled: true }),
      itemDescription: new FormControl({ value: inventory.item.description, disabled: true }),
      inventoryStatus: new FormControl({ value: inventory.inventoryStatus.name, disabled: true }),
      itemPackageType: new FormControl({ value: inventory.itemPackageType.name, disabled: true }),
      quantity: new FormControl({ value: inventory.quantity, disabled: true }),
      locationName: new FormControl({ value: inventory.location.name, disabled: true }),
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
  ) {
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
    // console.log(`inventory.location.id: ${inventory.location.id}`);
    // console.log(
    //  `workOrder.productionLine.outboundStageLocationId: ${workOrder.productionLine.outboundStageLocationId}`,
    // );
    // inventory can be putaway only when it is in the production
    return inventory.location.id === workOrder.productionLine.outboundStageLocationId;
  }

  allocateLocation(workOrder: WorkOrder, inventory: Inventory) {
    this.putawayConfigurationService.allocateLocation(inventory).subscribe(allocatedInventory => {
      this.messageService.success(this.i18n.fanyi('message.allocate-location.success'));
      inventory.inventoryMovements = allocatedInventory.inventoryMovements;
      this.showWorkOrderDetails(workOrder);
    });
  }
  reallocateLocation(workOrder: WorkOrder, inventory: Inventory) {
    this.putawayConfigurationService.reallocateLocation(inventory).subscribe(allocatedInventory => {
      this.messageService.success(this.i18n.fanyi('message.allocate-location.success'));
      inventory.inventoryMovements = allocatedInventory.inventoryMovements;
      this.showWorkOrderDetails(workOrder);
    });
  }

  confirmPutaway(workOrder: WorkOrder, index: number, inventory: Inventory) {
    console.log(`confirm putaway with movement index ${index}, inventory: ${inventory.lpn}`);
    console.log(
      `confirm putaway with movement index ${inventory.inventoryMovements[index].location.name}, inventory: ${inventory.lpn}`,
    );

    this.inventoryService.move(inventory, inventory.inventoryMovements[index].location).subscribe(inventory => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.showWorkOrderDetails(workOrder);
    });
  }

  openManualPutawayModal(
    workOrder: WorkOrder,
    inventory: Inventory,
    tplManualPutawayModalTitle: TemplateRef<{}>,
    tplManualPutawayModalContent: TemplateRef<{}>,
  ) {
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
  manualPutawayInventory(workOrder: WorkOrder, inventory: Inventory) {
    if (inventory.locationName) {
      // Location name is setup
      // Let's find the location by name and assign it to the inventory
      // that will be received
      console.log(`Will setup received inventory's location to ${inventory.locationName}`);

      this.locationService.getLocations(null, null, inventory.locationName).subscribe(locations => {
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
}
