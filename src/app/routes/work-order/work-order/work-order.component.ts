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
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WorkOrderKpi } from '../models/work-order-kpi';
import { WorkOrderKpiTransaction } from '../models/work-order-kpi-transaction';
import { WorkOrderStatus } from '../models/work-order-status.enum';
import { ProductionLineService } from '../services/production-line.service';
import { PrintingService } from '../../common/services/printing.service';
import { ReportType } from '../../report/models/report-type.enum';
import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { ReportOrientation } from '../../report/models/report-orientation.enum';

@Component({
  selector: 'app-work-order-work-order',
  templateUrl: './work-order.component.html',
  styleUrls: ['./work-order.component.less'],
})
export class WorkOrderWorkOrderComponent implements OnInit {

  listOfColumns: ColumnItem[] = [    
    {
          name: 'work-order.number',
          showSort: true,
          sortOrder: null,
          sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableString(a.number, b.number),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'status',
          showSort: true,
          sortOrder: null,
          sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableString(a.status?.toString(), b.status?.toString()),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'item',
          showSort: true,
          sortOrder: null,
          sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'work-order.expected-quantity',
          showSort: true,
          sortOrder: null,
          sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableNumber(a.expectedQuantity, b.expectedQuantity),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'work-order.produced-quantity',
          showSort: true,
          sortOrder: null,
          sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableNumber(a.producedQuantity, b.producedQuantity),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'work-order.totalLineExpectedQuantity',
          showSort: true,
          sortOrder: null,
          sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableNumber(a.totalLineExpectedQuantity, b.totalLineExpectedQuantity),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'work-order.totalLineOpenQuantity',
          showSort: true,
          sortOrder: null,
          sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableNumber(a.totalLineOpenQuantity, b.totalLineOpenQuantity),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'work-order.totalLineInprocessQuantity',
          showSort: true,
          sortOrder: null,
          sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableNumber(a.totalLineInprocessQuantity,  b.totalLineInprocessQuantity),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'work-order.totalLineDeliveredQuantity',
          showSort: true,
          sortOrder: null,
          sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableNumber(a.totalLineDeliveredQuantity, b.totalLineDeliveredQuantity),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'work-order.totalLineConsumedQuantity',
          showSort: true,
          sortOrder: null,
          sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableNumber(a.totalLineConsumedQuantity, b.totalLineConsumedQuantity),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, 
        /***{
          name: 'production-line',
          showSort: true,
          sortOrder: null,
          sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableObjField(a.productionPlanLine, b.productionPlanLine, 'name'),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, 
        **/
        ];

        expandSet = new Set<number>();
        


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
    private utilService: UtilService,
    private printingService: PrintingService,
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


  printingInProcess = false;
  isSpinning = false;
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

  
  onExpandChange(workOrder: WorkOrder, expanded: boolean): void {
    if (expanded) {
      this.expandSet.add(workOrder.id!);
      this.showWorkOrderDetails(workOrder);
    } else {
      this.expandSet.delete(workOrder.id!);
    }
  }

   
  
  loadAvailableProductionLine(): void {
    this.availableProductionLines = [];
    // load all available production lines
    this.productionLineService.getAvailableProductionLines().subscribe(productionLineRes => {
      productionLineRes.forEach(productionLine =>
        this.availableProductionLines.push({ label: productionLine.name, value: productionLine.id!.toString() }),
      );
    });
  }
  allocateWorkOrder(workOrder: WorkOrder): void {
    this.isSpinning = true;
    this.mapOfAllocationInProcessId[workOrder.id!] = true;
    this.workOrderService.allocateWorkOrder(workOrder).subscribe(workOrderRes => {
      this.messageService.success(this.i18n.fanyi('message.allocate.success'));
      this.mapOfAllocationInProcessId[workOrder.id!] = false;
      this.search();
      this.isSpinning = false;
    }, 
    () => this.isSpinning = false);
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
    return workOrder.productionLineAssignments!.length > 0;
  }
  // The user is allowed to change the production line only when
  // the work order is in pending status
  isProductionLineChangable(workOrder: WorkOrder): boolean {
    return workOrder.status === WorkOrderStatus.PENDING;
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
      workOrder.productionLineAssignments!.length > 0 &&
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
    if (this.expandSet.has(workOrder.id!)) { 
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
    if (workOrder.productionLineAssignments!.length  === 0) {
      return false;
    }
    return workOrder.productionLineAssignments!.some(productionLineAssignment => {
      inventory.location!.id ===  productionLineAssignment.productionLine.outboundStageLocationId 
    });
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


  
  printSelectedPutawayWork(workOrder: WorkOrder): void  {
    /***
     * 
    this.printingInProcess = true;

    this.putawayConfigurationService.printPutawaySheet(this.getSelectedProducedInventory(workOrder));
    // purposely to show the 'loading' status of the print button
    // for at least 1 second. The above printReceipt will
    // return immediately but the print job(or print preview page)
    // will start with some delay. During the delay, we will
    // display the 'print' button as 'Loading' status
    setTimeout(() => {
      this.printingInProcess = false;
    }, 1000);
     * 
     */
    this.printAllPutawayWork(this.mapOfProducedInventory[workOrder.id!]);
  }

  printAllPutawayWork(inventories: Inventory[]): void  {
    this.printingInProcess = true;
    this.putawayConfigurationService.printPutawaySheet(inventories);
    // purposely to show the 'loading' status of the print button
    // for at least 1 second. The above printReceipt will
    // return immediately but the print job(or print preview page)
    // will start with some delay. During the delay, we will
    // display the 'print' button as 'Loading' status
    setTimeout(() => {
      this.printingInProcess = false;
    }, 1000);
  }

  
  printPickSheets(workOrder: WorkOrder, event: any) : void {
    this.isSpinning = true;
    console.log(`start to print ${workOrder.number} from ${JSON.stringify(event)}`);

    this.workOrderService
      .printOrderPickSheet(workOrder, this.i18n.currentLang)
      .subscribe(printResult=> {
      
        // send the result to the printer
      this.printingService.printRemoteFileByName(
        "work order pick sheet", 
        printResult.fileName, 
        ReportType.ORDER_PICK_SHEET,
        event.printerIndex, 
        event.physicalCopyCount, PrintPageOrientation.Landscape);
       this.isSpinning = false;
       this.messageService.success(this.i18n.fanyi("report.print.printed"));
    });
    
  }
  previewReport(workOrder: WorkOrder) : void{
    this.isSpinning = true;
    console.log(`start to preview ${workOrder.number}`);
    this.workOrderService.printOrderPickSheet(workOrder, this.i18n.currentLang).subscribe(printResult=> {
      // console.log(`Print success! result: ${JSON.stringify(printResult)}`);
      this.isSpinning = false;
      this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.LANDSCAPE}`);
      
    });
  }
  

}
