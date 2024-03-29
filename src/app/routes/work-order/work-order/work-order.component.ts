import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { PrintPageSize } from '../../common/models/print-page-size.enum';
import { PrintingService } from '../../common/services/printing.service';
import { PutawayConfigurationService } from '../../inbound/services/putaway-configuration.service';
import { Inventory } from '../../inventory/models/inventory';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { ItemService } from '../../inventory/services/item.service';
import { PickWork } from '../../outbound/models/pick-work';
import { ShortAllocation } from '../../outbound/models/short-allocation';
import { ShortAllocationStatus } from '../../outbound/models/short-allocation-status.enum';
import { PickService } from '../../outbound/services/pick.service';
import { ShortAllocationService } from '../../outbound/services/short-allocation.service';
import { ReportOrientation } from '../../report/models/report-orientation.enum';
import { ReportType } from '../../report/models/report-type.enum';
import { ColumnItem } from '../../util/models/column-item';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { UtilService } from '../../util/services/util.service';
import { WebClientConfigurationService } from '../../util/services/web-client-configuration.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { BillOfMaterial } from '../models/bill-of-material';
import { ProductionLineAllocationRequest } from '../models/production-line-allocation-request';
import { ProductionLineAllocationRequestLine } from '../models/production-line-allocation-request-line';
import { ProductionLineAssignment } from '../models/production-line-assignment';
import { WorkOrder } from '../models/work-order';
import { WorkOrderKpi } from '../models/work-order-kpi';
import { WorkOrderKpiTransaction } from '../models/work-order-kpi-transaction';
import { WorkOrderMaterialConsumeTiming } from '../models/work-order-material-consume-timing';
import { WorkOrderStatus } from '../models/work-order-status.enum';
import { BillOfMaterialService } from '../services/bill-of-material.service';
import { ProductionLineAssignmentService } from '../services/production-line-assignment.service';
import { ProductionLineService } from '../services/production-line.service';
import { WorkOrderService } from '../services/work-order.service';
 
@Component({
  selector: 'app-work-order-work-order',
  templateUrl: './work-order.component.html',
  styleUrls: ['./work-order.component.less'],
})
export class WorkOrderWorkOrderComponent implements OnInit {

  listOfColumns: Array<ColumnItem<WorkOrder>> = [
    {
      name: 'work-order.number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableString(a.number, b.number),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      rowspan: 2,
      colspan: 1 
    }, {
      name: 'status',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableString(a.status?.toString(), b.status?.toString()),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      rowspan: 2,
      colspan: 1,
    }, {
      name: 'work-order.item',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      rowspan: 2,
      colspan: 1,
    }, {
      name: 'description',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableObjField(a.item?.description, b.item?.description, 'description'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      rowspan: 2,
      colspan: 1,
    }, {
      name: 'work-order.expected-quantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableNumber(a.expectedQuantity, b.expectedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      rowspan: 2,
      colspan: 1,
    }, {
      name: 'work-order.produced-quantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableNumber(a.producedQuantity, b.producedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      rowspan: 2,
      colspan: 1,
    },
    {
      name: 'qcQuantity',
      showSort: false,
      sortOrder: null,
      sortFn: null,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      rowspan: 1,
      colspan: 4,
    },
    {
      name: 'work-order.totalInprocessQuantity',
      showSort: false,
      sortOrder: null,
      sortFn: null,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      rowspan: 1,
      colspan: 5,
    }];
  listOfStatisticsColumns: Array<ColumnItem<WorkOrder>> = [{
    name: 'work-order.totalLineExpectedQuantity',
    showSort: true,
    sortOrder: null,
    sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableNumber(a.totalLineExpectedQuantity, b.totalLineExpectedQuantity),
    sortDirections: ['ascend', 'descend'],
    filterMultiple: true,
    listOfFilter: [],
    filterFn: null,
    showFilter: false,
    rowspan: 1,
    colspan: 1,
  }, {
    name: 'work-order.totalLineOpenQuantity',
    showSort: true,
    sortOrder: null,
    sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableNumber(a.totalLineOpenQuantity, b.totalLineOpenQuantity),
    sortDirections: ['ascend', 'descend'],
    filterMultiple: true,
    listOfFilter: [],
    filterFn: null,
    showFilter: false,
    rowspan: 1,
    colspan: 1,
  }, {
    name: 'work-order.totalLineInprocessQuantity',
    showSort: true,
    sortOrder: null,
    sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableNumber(a.totalLineInprocessQuantity, b.totalLineInprocessQuantity),
    sortDirections: ['ascend', 'descend'],
    filterMultiple: true,
    listOfFilter: [],
    filterFn: null,
    showFilter: false,
    rowspan: 1,
    colspan: 1,
  }, {
    name: 'work-order.totalLineDeliveredQuantity',
    showSort: true,
    sortOrder: null,
    sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableNumber(a.totalLineDeliveredQuantity, b.totalLineDeliveredQuantity),
    sortDirections: ['ascend', 'descend'],
    filterMultiple: true,
    listOfFilter: [],
    filterFn: null,
    showFilter: false,
    rowspan: 1,
    colspan: 1,
  }, {
    name: 'work-order.totalLineConsumedQuantity',
    showSort: true,
    sortOrder: null,
    sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableNumber(a.totalLineConsumedQuantity, b.totalLineConsumedQuantity),
    sortDirections: ['ascend', 'descend'],
    filterMultiple: true,
    listOfFilter: [],
    filterFn: null,
    showFilter: false,
    rowspan: 1,
    colspan: 1,
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
  
  listOfQCColumns: Array<ColumnItem<WorkOrder>> = [{
    name: 'qcQuantity',
    showSort: true,
    sortOrder: null,
    sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableNumber(a.qcQuantity, b.qcQuantity),
    sortDirections: ['ascend', 'descend'],
    filterMultiple: true,
    listOfFilter: [],
    filterFn: null,
    showFilter: false,
    rowspan: 1,
    colspan: 1,
  }, {
    name: 'qcPercentage',
    showSort: true,
    sortOrder: null,
    sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableNumber(a.qcPercentage, b.qcPercentage),
    sortDirections: ['ascend', 'descend'],
    filterMultiple: true,
    listOfFilter: [],
    filterFn: null,
    showFilter: false,
    rowspan: 1,
    colspan: 1,
  }, {
    name: 'qcQuantityRequested',
    showSort: true,
    sortOrder: null,
    sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableNumber(a.qcQuantityRequested, b.qcQuantityRequested),
    sortDirections: ['ascend', 'descend'],
    filterMultiple: true,
    listOfFilter: [],
    filterFn: null,
    showFilter: false,
    rowspan: 1,
    colspan: 1,
  }, {
    name: 'qcQuantityCompleted',
    showSort: true,
    sortOrder: null,
    sortFn: (a: WorkOrder, b: WorkOrder) => this.utilService.compareNullableNumber(a.qcQuantityCompleted, b.qcQuantityCompleted),
    sortDirections: ['ascend', 'descend'],
    filterMultiple: true,
    listOfFilter: [],
    filterFn: null,
    showFilter: false,
    rowspan: 1,
    colspan: 1,
  },   
  ];


  expandSet = new Set<number>();
  allocateByProductionLineOptions = "BY_WORK_ORDER";
  
  shortAllocationStatus = ShortAllocationStatus;


  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private workOrderService: WorkOrderService,
    private messageService: NzMessageService,
    private productionLineService: ProductionLineService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private pickService: PickService,
    private shortAllocationService: ShortAllocationService,
    private putawayConfigurationService: PutawayConfigurationService,
    private inventoryService: InventoryService,
    private locationService: LocationService,
    private utilService: UtilService,
    private printingService: PrintingService,
    private webClientConfigurationService: WebClientConfigurationService,
    private productionLineAssignmentService: ProductionLineAssignmentService,
    private itemService: ItemService,
    private inventoryStatusService: InventoryStatusService,
    private billOfMaterialService: BillOfMaterialService,
    private localCacheService: LocalCacheService,
    private userService: UserService,
    
  ) { 
    userService.isCurrentPageDisplayOnly("/work-order/work-order").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );
  }
  workOrderStatuses = WorkOrderStatus;
  // Form related data and functions
  searchForm!: UntypedFormGroup;
  searching = false;
  searchResult = '';
  allocating = false;
  unpickForm!: UntypedFormGroup;
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

  producedInventoryPageSize = 10;
  mapOfReturnedInventory: { [key: string]: Inventory[] } = {};
  mapOfProducedByProduct: { [key: string]: Inventory[] } = {};
  mapOfKPIs: { [key: string]: WorkOrderKpi[] } = {};
  mapOfKPITransactions: { [key: string]: WorkOrderKpiTransaction[] } = {};

  mapOfPicks: { [key: string]: PickWork[] } = {};
  mapOfShortAllocations: { [key: string]: ShortAllocation[] } = {};


  printingInProcess = false;
  isSpinning = false;
  

  isDeliveredInventorySpinning = false;
  isProducedInventorySpinning = false;
  isProducedByProductSpinning = false;
  isReturnedInventorySpinning = false;
  isKPITransactionsSpinning = false;
  isKPIsSpinning = false;
  isPicksSpinning = false;
  isShortAllocationsSpinning = false;


  productionLineAllocationRequests: ProductionLineAllocationRequest[] = []; 
  productionLineAllocationRequestModal!: NzModalRef;

  
  workOrderConsumeMethodModal!: NzModalRef;
  currentWorkOrder?: WorkOrder;
  currentWorkOrderConsumeByBomNumber: string = "";
  currentWorkOrderConsumeByBomFlag = 'yes';
  currentWorkOrderMatchedBOM: BillOfMaterial[] = [];
  materialConsumeTimings = WorkOrderMaterialConsumeTiming;
  currentWorkOrderMaterialConsumeTiming?: WorkOrderMaterialConsumeTiming;

  recalculateQCForm!: UntypedFormGroup;
  recalculateQCModal!: NzModalRef;
  formatterPercent = (value: number): string => `${value} %`;
  parserPercent = (value: string): string => value.replace(' %', '');

  ngOnInit(): void {
    // console.log(`webClientConfigurationService.getWebClientConfiguration().tabDisplayConfiguration: 
    //   ${JSON.stringify(this.webClientConfigurationService.getWebClientConfiguration().tabDisplayConfiguration["work-order.work-order.work-order.delivered-inventory"])}`);
    this.titleService.setTitle(this.i18n.fanyi('menu.main.work-order.work-order'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      item: [null],
      status: [null],
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
    this.isSpinning = true;
    this.searchResult = '';
    if (id) {
      this.workOrderService.getWorkOrder(id).subscribe(
        workOrderRes => {
          this.listOfAllWorkOrder = this.calculateWorkOrderLineTotalQuantities([workOrderRes]);
          this.listOfDisplayWorkOrder = this.listOfAllWorkOrder;
          this.refreshDetailInformation([workOrderRes], false);
          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: 1,
          });
        },
        () => {
          this.isSpinning = false;
          this.searchResult = '';
        },
      );
    } else {
      this.workOrderService
        .getWorkOrders(this.searchForm.controls.number.value, this.searchForm.controls.item.value, 
          undefined, this.searchForm.controls.status.value, false)
        .subscribe(
          workOrderRes => {
            this.listOfAllWorkOrder = this.calculateWorkOrderLineTotalQuantities(workOrderRes);
            this.refreshDetailInformation(workOrderRes, true);
            this.listOfDisplayWorkOrder = this.listOfAllWorkOrder;
            this.isSpinning = false;
            this.searchResult = this.i18n.fanyi('search_result_analysis', {
              currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
              rowCount: workOrderRes.length,
            });
          },
          () => {
            this.isSpinning = false;
            this.searchResult = '';
          },
        );
    }
    // we will no long load available production line here. 
    // instead we will assign production line to the work order
    // in a separate page
    
    // this.loadAvailableProductionLine();
    this.collapseAll();
  }

  collapseAll() {
    this.expandSet.clear();
  }

  calculateWorkOrderLineTotalQuantities(workOrders: WorkOrder[]): WorkOrder[] {
    workOrders.forEach(workOrder => {
      // init all the quantity to 0;
      this.calculateWorkOrderLineTotalQuantity(workOrder);
    });

    return workOrders;
  }
  refreshDetailInformation(workOrders: WorkOrder[], loadDetails: boolean): void {
    // in case we search the work order by 'loadDetails=false'
    // both the work order and work order line won't included 
    // item information and inventory status information.
    // they will only have the item id and inventory status id
    // but not the details like name / description. 
    // we will need to load the details async here to improve
    // the performance yet still show the meaningful information
    if (loadDetails) {      
      this.loadItemInformation(workOrders);
      this.loadInventoryStatusInformation(workOrders);
    }
    workOrders.forEach(workOrder => {
      // only refresh the detail information if it is expanded already
      if (this.expandSet.has(workOrder.id!)) {

        this.showWorkOrderDetails(workOrder);
      }
    });

  }
  loadItemInformation(workOrders: WorkOrder[]) {

      // ok, we will group the items all together then 
      // load the item in one transaction
      // to increase performance      
      let itemIdSet = new Set<number>(); 
      workOrders.forEach(
        workOrder => {
          itemIdSet.add(workOrder.itemId!);
          workOrder.workOrderLines.forEach(
            workOrderLine => itemIdSet.add(workOrderLine.itemId!)
          )
          workOrder.workOrderByProducts.forEach(
            workOrderByProduct => itemIdSet.add(workOrderByProduct.itemId!)
          )
        }
      )
      if (itemIdSet.size > 0) {

        let itemMap = new Map<number, Item>(); 
        let itemIdList : string = Array.from(itemIdSet).join(',')
        this.itemService.getItemsByIdList(itemIdList, false).subscribe({
          next: (itemRes) => {

            // add the result to a map so we can assign it to 
            // the work order / work order line later on
            itemRes.forEach(
              item =>  itemMap.set(item.id!, item)
            );
            workOrders.forEach(
              workOrder => {
                // only assign if we get the item from the server
                if (itemMap.has(workOrder.itemId!)) {
                  workOrder.item = itemMap.get(workOrder.itemId!)
                  this.loadDefaultStockUom(workOrder.item!);
                  
                }
                workOrder.workOrderLines.forEach(
                  workOrderLine => {                    
                    if (itemMap.has(workOrderLine.itemId!)) {
                      workOrderLine.item = itemMap.get(workOrderLine.itemId!)
                      this.loadDefaultStockUom(workOrderLine.item!);
                    }
                  }
                )
                workOrder.workOrderByProducts.forEach(
                  byProduct => {                    
                    if (itemMap.has(byProduct.itemId!)) {
                      byProduct.item = itemMap.get(byProduct.itemId!)
                      this.loadDefaultStockUom(byProduct.item!);
                    }
                  }
                )
              }
            )
          }
        })
      }
  }
  loadDefaultStockUom(item: Item) {

    // load the default item package type's stock item unit of measure
    // so that we can show the stock unit of measure in the screenshot
    if (item.defaultItemPackageType?.stockItemUnitOfMeasure?.unitOfMeasureId != null &&
                  item.defaultItemPackageType?.stockItemUnitOfMeasure?.unitOfMeasure == null ) {
        
        this.localCacheService.getUnitOfMeasure(item.defaultItemPackageType?.stockItemUnitOfMeasure?.unitOfMeasureId)
            .subscribe({
              next: (unitOfMeasureRes) => { 
                    item.defaultItemPackageType!.stockItemUnitOfMeasure!.unitOfMeasure = unitOfMeasureRes;
              }
            })
    }
  }
  loadInventoryStatusInformation(workOrders: WorkOrder[]) {
    // we will reasonablly assume there's very few inventory status
    // in the system so we will get all from the server now

    let inventoryStatusMap = new Map<number, InventoryStatus>(); 
    this.inventoryStatusService.loadInventoryStatuses().subscribe({
      next: (inventoryStatusRes) => {        
            // add the result to a map so we can assign it to 
            // the work order / work order line later on
            inventoryStatusRes.forEach(
              inventoryStatus => inventoryStatusMap.set(inventoryStatus.id!, inventoryStatus)
            );
            workOrders.forEach(
              workOrder => {
                workOrder.workOrderLines.forEach(
                  workOrderLine => {                    
                    if (inventoryStatusMap.has(workOrderLine.inventoryStatusId!)) {
                      workOrderLine.inventoryStatus = inventoryStatusMap.get(workOrderLine.inventoryStatusId!)
                    }
                  }
                );
                workOrder.workOrderByProducts.forEach(
                  byProduct => {                    
                    if (inventoryStatusMap.has(byProduct.inventoryStatusId!)) {
                      byProduct.inventoryStatus = inventoryStatusMap.get(byProduct.inventoryStatusId!)
                    }
                  }
                )
              }
            )
      }
    });
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
    return workOrder.status !== WorkOrderStatus.COMPLETED &&
      workOrder.productionLineAssignments!.length > 0;
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
    return workOrder.productionLineAssignments!.length > 0;
    /**
     * Note: 
     * Currently we allow the user to receive from work order and consume
     * the raw material in 3 ways
     * 1. allocate and pick from the storage
     * 2. move the raw material without any picking, into the production line's 
     *    inbound stage location
     * 3. raw material can be produced by any other work order, we will allow
     *    the user to consume from other work order directly
     * 
    return (
      workOrder.productionLineAssignments!.length > 0 &&
      workOrder.totalLineInprocessQuantity! > 0 &&
      workOrder.totalLineDeliveredQuantity! > 0 &&
      workOrder.status === WorkOrderStatus.INPROCESS
    );
     */
  }


  produceFromWorkOrder(workOrder: WorkOrder): void {
    this.router.navigateByUrl(`/work-order/work-order/produce?id=${workOrder.id}`);
  }

  showDeliveredInventory(workOrder: WorkOrder): void {
    
    this.isDeliveredInventorySpinning = true;

    this.workOrderService.getDeliveredInventory(workOrder).subscribe({

      next: (deliveredInventoryRes) => {
        this.mapOfDeliveredInventory[workOrder.id!] = [...deliveredInventoryRes];
        this.isDeliveredInventorySpinning = false;
      },
      error: () => this.isDeliveredInventorySpinning = false
    });
  }

  showProducedByProduct(workOrder: WorkOrder): void {
    this.isProducedByProductSpinning = true;
    this.workOrderService.getProducedByProduct(workOrder).subscribe({

      next: (producedByProductRes)=> {
        this.mapOfProducedByProduct[workOrder.id!] = [...producedByProductRes];
        this.isProducedByProductSpinning = false;
      },
      error: () => this.isProducedByProductSpinning = false

    });
  }

  showProducedInventory(workOrder: WorkOrder): void {
    this.isProducedInventorySpinning = true;
    this.workOrderService.getProducedInventory(workOrder).subscribe({
      next: (returnedInventoryRes) => {
        this.mapOfProducedInventory[workOrder.id!] = [...returnedInventoryRes];
        this.isProducedInventorySpinning = false;
      },
      error: () => this.isProducedInventorySpinning = false
    }); 
  }

  showReturnedInventory(workOrder: WorkOrder): void {
    this.isReturnedInventorySpinning = true;
    this.workOrderService.getReturnedInventory(workOrder).subscribe({

      next: (producedInventoryRes) => {
        this.mapOfReturnedInventory[workOrder.id!] = [...producedInventoryRes];
        this.isReturnedInventorySpinning = false;
      },
      error: () => this.isReturnedInventorySpinning = false

    });
    
  }

  showKPIs(workOrder: WorkOrder): void {
    this.isKPIsSpinning = true;
    this.workOrderService.getKPIs(workOrder).subscribe({

      next: (workOrderKPIs) => {
        this.mapOfKPIs[workOrder.id!] = [...workOrderKPIs];
        this.isKPIsSpinning = false;
      },
      error: () => this.isKPIsSpinning = false

    }); 
    
  }

  showKPITransactions(workOrder: WorkOrder): void {
    this.isKPITransactionsSpinning = true;
    this.workOrderService.getKPITransactions(workOrder).subscribe({
      next: (workOrderKPITransactions) => {
        workOrderKPITransactions.forEach(transaction => {
          console.log(
            `transaction: ${transaction.amount}, type: ${transaction.type}, createdBy: ${transaction.createdTime}`,
          );
          console.log(`transaction: ${JSON.stringify(transaction)}`);
        });
        this.mapOfKPITransactions[workOrder.id!] = [...workOrderKPITransactions];
        this.isKPITransactionsSpinning = false;
      },
      error: () => this.isKPITransactionsSpinning = false
    });
    
  }
  showPicks(workOrder: WorkOrder): void {
    this.isPicksSpinning = true;
    this.pickService.getPicksByWorkOrder(workOrder)
      .subscribe({

        next: (pickRes) => {
          this.mapOfPicks[workOrder.id!] = [...pickRes];
          this.isPicksSpinning = false;
        },
        error: () => this.isPicksSpinning = false
      });
  }
  
  showShortAllocations(workOrder: WorkOrder): void {
    this.isShortAllocationsSpinning = true;
    this.shortAllocationService.getShortAllocationsByWorkOrder(workOrder)
      .subscribe({

        next: (shortAllocationRes) => {
          this.mapOfShortAllocations[workOrder.id!] = shortAllocationRes.filter(
            shortAllocation => shortAllocation.status !== ShortAllocationStatus.CANCELLED
          );
          
          this.isShortAllocationsSpinning = false;
        },
        error: () => this.isShortAllocationsSpinning = false
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
      this.showPicks(workOrder);
      this.showShortAllocations(workOrder); 
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
      deliveredQuantity: new UntypedFormControl({ value: deliveredQuantity, disabled: true }),
      consumedQuantity: new UntypedFormControl({ value: consumedQuantity, disabled: true }),
      overrideConsumedQuantity: [null],
      lpn: new UntypedFormControl({ value: inventory.lpn, disabled: true }),
      itemNumber: new UntypedFormControl({ value: inventory.item!.name, disabled: true }),
      itemDescription: new UntypedFormControl({ value: inventory.item!.description, disabled: true }),
      inventoryStatus: new UntypedFormControl({ value: inventory.inventoryStatus!.name, disabled: true }),
      itemPackageType: new UntypedFormControl({ value: inventory.itemPackageType!.name, disabled: true }),
      quantity: new UntypedFormControl({ value: inventory.quantity, disabled: true }),
      locationName: new UntypedFormControl({ value: inventory.location!.name, disabled: true }),
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
    // console.log(`workOrder.productionLineAssignments!.length:${workOrder.productionLineAssignments!.length}`);
    if (workOrder.productionLineAssignments!.length === 0) {
      return false;
    }
    return workOrder.productionLineAssignments!.some(productionLineAssignment =>
      inventory.location!.id == productionLineAssignment.productionLine.outboundStageLocationId
    );
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

  printSelectedPutawayWork(workOrder: WorkOrder): void {
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

  printAllPutawayWork(inventories: Inventory[]): void {
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


  printPickSheets(workOrder: WorkOrder, event: any): void {
    this.isSpinning = true;
    console.log(`start to print ${workOrder.number} from ${JSON.stringify(event)}`);

    this.workOrderService
      .printOrderPickSheet(workOrder, this.i18n.currentLang)
      .subscribe(printResult => {

        console.log(` PDF file generated, will try to print it`);
        // send the result to the printer
        this.printingService.printFileByName(
          "work order pick sheet",
          printResult.fileName,
          ReportType.ORDER_PICK_SHEET,
          event.printerIndex,
          event.printerName,
          event.physicalCopyCount, PrintPageOrientation.Landscape, 
          PrintPageSize.Letter,
          workOrder.number,
          printResult);
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("report.print.printed"));
      },
        () => this.isSpinning = false);

  }
  previewReport(workOrder: WorkOrder): void {
    this.isSpinning = true;
    console.log(`start to preview ${workOrder.number}`);
    this.workOrderService.printOrderPickSheet(workOrder, this.i18n.currentLang).subscribe(printResult => {
      // console.log(`Print success! result: ${JSON.stringify(printResult)}`);
      this.isSpinning = false;
      this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.LANDSCAPE}`);

    });
  }

  generateEmptyProductionLineAllocationRequests(workOrder: WorkOrder): ProductionLineAllocationRequest[] {
    let productionLineAllocationRequests: ProductionLineAllocationRequest[] = [];
    if (workOrder.productionLineAssignments) {
      workOrder.productionLineAssignments.forEach(
        productionLineAssignment => {
          // construct the line allocation request, in case the user want to allocate by work order line.
          // by default we will allocate by work order
          let productionLineAllocationRequestLines: ProductionLineAllocationRequestLine[] = []; 
          productionLineAssignment.lines.forEach(
            productionLineAssignmentLine => {
              productionLineAllocationRequestLines.push({
                
                  workOrderLineId: productionLineAssignmentLine.workOrderLine.id!,
                  totalQuantity: productionLineAssignmentLine.quantity,
                  openQuantity: productionLineAssignmentLine.openQuantity,
                  allocatingQuantity: productionLineAssignmentLine.openQuantity, // by default, we will allocate the whole open quantity
                  
                  itemName: productionLineAssignmentLine.workOrderLine.item!.name,
                  workOrderLineNumber: productionLineAssignmentLine.workOrderLine.number!,
                  itemDescription: productionLineAssignmentLine.workOrderLine.item?.description,
                  productionLineName: productionLineAssignment.productionLine.name,
              })
            }
          ) 
          productionLineAllocationRequests.push({
            workOrderId: workOrder.id!,
            productionLineId: productionLineAssignment.productionLine.id!,
            productionLineName: productionLineAssignment.productionLine.name,
            totalQuantity: productionLineAssignment.quantity,
            openQuantity: productionLineAssignment.openQuantity,
            allocatingQuantity: productionLineAssignment.openQuantity, // by default, we will allocate the whole open quantity
            allocateByLine: this.allocateByProductionLineOptions === 'BY_WORK_ORDER_LINE' ,
            lines: productionLineAllocationRequestLines,
          });
        }
      )
    }
    return productionLineAllocationRequests;

  }

  openAllocateByProductionLineModal(
    workOrder: WorkOrder,
    tplAllocateByProductionLineModalTitle: TemplateRef<{}>,
    tplAllocateByProductionLineModalContent: TemplateRef<{}>,
  ): void {
    // we will load the detail information of the  work order before we continue
    this.workOrderService.getWorkOrder(workOrder.id!).subscribe({

      next: (workOrderRes) => {
        this.productionLineAllocationRequests = this.generateEmptyProductionLineAllocationRequests(workOrderRes);
    
        // Load the location
        this.productionLineAllocationRequestModal = this.modalService.create({
          nzTitle: tplAllocateByProductionLineModalTitle,
          nzContent: tplAllocateByProductionLineModalContent,
          nzOkText: this.i18n.fanyi('confirm'),
          nzCancelText: this.i18n.fanyi('cancel'),
          nzMaskClosable: false,
          nzOnCancel: () => {
            this.productionLineAllocationRequestModal.destroy();
          },
          nzOnOk: () => {
            this.allocateWorkOrderByProductionLine(
              workOrderRes, this.productionLineAllocationRequests
            );
          },
    
          nzWidth: 1000,
        });

      }
    });
  }

  reverseByProduct(workOrder: WorkOrder, inventory: Inventory): void { 
    
    this.isSpinning = true;

    this.workOrderService.reverseByProduct(workOrder, inventory.lpn!)
      .subscribe(workOrderRes => {
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search()

      },
        () => this.isSpinning = false);

    
  }
  reverseProduction(workOrder: WorkOrder, inventory: Inventory): void { 
    
    this.isSpinning = true;

    this.workOrderService.reverseProduction(workOrder.id!, inventory.lpn!)
      .subscribe(workOrderRes => {
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search()

      },
        () => this.isSpinning = false);

    
  }

  allocateByProductionLineOptionsChanged() { 
    if (this.allocateByProductionLineOptions === 'BY_WORK_ORDER') {

      this.productionLineAllocationRequests.forEach(
        productionLineAllocationRequest => productionLineAllocationRequest.allocateByLine = false
      );
    }
    else { 
      this.productionLineAllocationRequests.forEach(
        productionLineAllocationRequest => {
          productionLineAllocationRequest.allocateByLine = true
           
        }

      );


    } 
  }
  allocateWorkOrderByProductionLine(workOrder: WorkOrder, productionLineAllocationRequests: ProductionLineAllocationRequest[]) {

    this.isSpinning = true;

    this.workOrderService.allocateWorkOrder(workOrder, productionLineAllocationRequests)
      .subscribe(workOrderRes => {
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search()

      },
        () => this.isSpinning = false);


  }


  cancelPick(workOrder: WorkOrder, pick: PickWork, 
    errorLocation: boolean, generateCycleCount: boolean): void {
    this.isSpinning = true;
    this.pickService.cancelPick(pick, errorLocation, generateCycleCount).subscribe(pickRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search(workOrder.id);
      this.isSpinning = false;
    },
      () =>
        this.isSpinning = true);
  }

  isTabVisible(tabName: string): boolean {
    return this.webClientConfigurationService.isTabVisible(tabName);
  }


  printProductionLineAssignmentReport(event: any, productionLineAssignment: ProductionLineAssignment) {

    this.isSpinning = true;

    this.productionLineAssignmentService.generateroductionLineAssignmentReport(
      productionLineAssignment.id!)
      .subscribe(printResult => {

        // send the result to the printer
        const printFileUrl
          = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
        console.log(`will print file: ${printFileUrl}`);
        this.printingService.printFileByName(
          "Work Order Assignment Report",
          printResult.fileName,
          ReportType.PRODUCTION_LINE_ASSIGNMENT_REPORT,
          event.printerIndex,
          event.printerName,
          event.physicalCopyCount,
          PrintPageOrientation.Portrait,
          PrintPageSize.Letter,
          productionLineAssignment.productionLine.name, 
          printResult);
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("report.print.printed"));
      },
        () => {
          this.isSpinning = false;
        },

      );

  }
  previewProductionLineAssignmentReport(productionLineAssignment: ProductionLineAssignment): void {


    this.isSpinning = true;
    this.productionLineAssignmentService.generateroductionLineAssignmentReport(
      productionLineAssignment.id!)
      .subscribe(printResult => {
        // console.log(`Print success! result: ${JSON.stringify(printResult)}`);
        this.isSpinning = false;
        this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.PORTRAIT}`);

      },
        () => {
          this.isSpinning = false;
        },
      );
  }

  
  printProductionLineAssignmentLabel(event: any, productionLineAssignment: ProductionLineAssignment) {

    this.isSpinning = true;

    this.productionLineAssignmentService.generateroductionLineAssignmentLabel(
      productionLineAssignment.id!)
      .subscribe(printResult => {

        // send the result to the printer
        const printFileUrl
          = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
        console.log(`will print file: ${printFileUrl}`);
        this.printingService.printFileByName(
          "Work Order Assignment Report",
          printResult.fileName,
          ReportType.PRODUCTION_LINE_ASSIGNMENT_REPORT,
          event.printerIndex,
          event.printerName,
          event.physicalCopyCount,
          PrintPageOrientation.Portrait,
          PrintPageSize.Letter,
          productionLineAssignment.productionLine.name, 
          printResult);
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("report.print.printed"));
      },
        () => {
          this.isSpinning = false;
        },

      );

  }
  previewProductionLineAssignmentLabel(productionLineAssignment: ProductionLineAssignment): void {


    this.isSpinning = true;
    this.productionLineAssignmentService.generateroductionLineAssignmentLabel(
      productionLineAssignment.id!)
      .subscribe(printResult => {
        // console.log(`Print success! result: ${JSON.stringify(printResult)}`);
        this.isSpinning = false;
        this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.PORTRAIT}`);

      },
        () => {
          this.isSpinning = false;
        },
      );
  }
  
  cancelShortAllocation(workOrder: WorkOrder, shortAllocation: ShortAllocation): void {
    this.shortAllocationService.cancelShortAllocations([shortAllocation]).subscribe(shortAllocationRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      // refresh the short allocation
      this.search(workOrder.id);
    });
  }

  
  isShortAllocationAllocatable(shortAllocation: ShortAllocation): boolean {
    return shortAllocation.openQuantity > 0;
  }
  allocateShortAllocation(workOrder: WorkOrder, shortAllocation: ShortAllocation): void {
    this.shortAllocationService.allocateShortAllocation(shortAllocation).subscribe(shortAllocationRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search(workOrder.id);
    });
  }


  openWorkOrderConsumeMethodModal(
    workOrder: WorkOrder,
    tplWorkOrderConsumeMethodModalTitle: TemplateRef<{}>,
    tplWorkOrderConsumeMethodModalContent: TemplateRef<{}>,
  ): void { 
    this.currentWorkOrderMaterialConsumeTiming = workOrder.materialConsumeTiming;
    this.currentWorkOrder = workOrder;
    this.materialConsumeTimingChange();
    this.currentWorkOrderConsumeByBomFlag = 'yes' // we will only allow consume by BOM
    this.currentWorkOrderConsumeByBomNumber = workOrder.consumeByBom ?
        workOrder.consumeByBom.number! : "";

    // Load the location
    this.workOrderConsumeMethodModal = this.modalService.create({
      nzTitle: tplWorkOrderConsumeMethodModalTitle,
      nzContent: tplWorkOrderConsumeMethodModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.workOrderConsumeMethodModal.destroy();
      },
      nzOnOk: () => {
        if (this.currentWorkOrderMaterialConsumeTiming === undefined || this.currentWorkOrderMaterialConsumeTiming === null) {
          this.messageService.error("please set the material consume timing");
          return false;
        }
        return this.changeWorkOrderConsumeMethod(
          workOrder, this.currentWorkOrderMaterialConsumeTiming!, 
          this.currentWorkOrderConsumeByBomFlag, this.currentWorkOrderConsumeByBomNumber
        );
      },

      nzWidth: 1000,
    });
  }

  materialConsumeTimingChange() {
    console.log(`this.currentWorkOrderMaterialConsumeTiming: ${this.currentWorkOrderMaterialConsumeTiming}`);
    if (this.currentWorkOrderMaterialConsumeTiming == WorkOrderMaterialConsumeTiming.BY_TRANSACTION) {
       
        this.loadValidBOM(this.currentWorkOrder!);
    } 
  }
  currentWorkOrderConsumeByBomChanged() {
    if (this.currentWorkOrderConsumeByBomFlag == 'yes') {
       
        this.loadValidBOM(this.currentWorkOrder!);
    } 
  }
  loadValidBOM(workOrder: WorkOrder) {
    console.log(`start to load BOM for ${JSON.stringify(workOrder.item)}`)
    if (workOrder.item === undefined || workOrder.item === null) {

      this.currentWorkOrderMatchedBOM = [];
    }
    else {

      this.billOfMaterialService.findMatchedBillOfMaterialByItemName(
        workOrder.item!.name
      ).subscribe({
        next: (bomRes) => this.currentWorkOrderMatchedBOM = bomRes
      })
    }
  }
  changeWorkOrderConsumeMethod(workOrder: WorkOrder, 
    materialConsumeTiming: WorkOrderMaterialConsumeTiming,
    consumeByBomFlag: string, consumeByBomNumber: string) {
      this.isSpinning = true;
      // first, make sure the value is corret
      if (materialConsumeTiming !== WorkOrderMaterialConsumeTiming.BY_TRANSACTION) {
        // if we won't consume the material per transaction, then there's no 
        // need to setup the work order's consuming BOM 
        this.workOrderService.changeWorkOrderConsumeMethod(
          workOrder.id!, materialConsumeTiming, false
        ).subscribe({
          next: () => {
            
            this.messageService.success(this.i18n.fanyi("message.action.success"));
            this.isSpinning = false;
            this.searchForm.controls.number.setValue(workOrder.number);
            this.search();
           },
          error: () => this.isSpinning = false, 
        })

      }
      else if (consumeByBomFlag === 'yes') {
        // the user setup the work order to be consumed by bom but
        // there's no bom setup , return false;
        if (consumeByBomNumber === '') {

          this.isSpinning = false;
          this.messageService.error("consume by bom is not setup")
          return false;
        }
        let consumeByBOM: BillOfMaterial | undefined = 
            this.currentWorkOrderMatchedBOM
            .find(matchedBOM => matchedBOM.number === consumeByBomNumber);
        if (consumeByBOM === undefined) {        
          this.isSpinning = false;
          this.messageService.error(`can't find BOM with number ${consumeByBomNumber}`);
          return false;
        } 
        // will set the work order's consume by BOM
        this.workOrderService.changeWorkOrderConsumeMethod(
          workOrder.id!, materialConsumeTiming, true, consumeByBOM.id!
        ).subscribe({
          next: () => {
            
          this.messageService.success(this.i18n.fanyi("message.action.success"));
          this.isSpinning = false;
          this.searchForm.controls.number.setValue(workOrder.number);
          this.search();
         },
          error: () => this.isSpinning = false, 
        })
      }
      else {
        // will set the work order to not consume by BOM
        this.workOrderService.changeWorkOrderConsumeMethod(
          workOrder.id!, materialConsumeTiming, false
        ).subscribe({
          next: () => {
            
            this.messageService.success(this.i18n.fanyi("message.action.success"));
            this.isSpinning = false;
            this.searchForm.controls.number.setValue(workOrder.number);
            this.search();
           },
          error: () => this.isSpinning = false, 
        })

      }

      return true;

    }

    recalculateQCQuantity(workOrder: WorkOrder, qcQuantity?: number, qcPercentage?: number) {

      this.isSpinning = true; 
      this.workOrderService.recalculateQCQuantity(workOrder, qcQuantity, qcPercentage).subscribe(
        {
          next: () => {
            
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            this.isSpinning = false;
            this.searchForm.controls.number.setValue(workOrder.number);
            this.search();
          },
          error: () => this.isSpinning = false
        }
      );
    }
    
  openRecalculateQCModal(
    workOrder: WorkOrder,
    tplRecalculateQCModalTitle: TemplateRef<{}>,
    tplRecalculateQCModalContent: TemplateRef<{}>,
  ): void {
    
    this.recalculateQCForm = this.fb.group({
      qcQuantity: new UntypedFormControl({ value: workOrder.qcQuantity, disabled: true }),
      newQCQuantity: new UntypedFormControl({ value: workOrder.qcQuantity, disabled: false}),
      qcPercentage: new UntypedFormControl({ value: workOrder.qcPercentage, disabled: true }),
      newQCPercentage: new UntypedFormControl({ value: workOrder.qcPercentage, disabled: false }),
    });

    // Load the location
    this.recalculateQCModal = this.modalService.create({
      nzTitle: tplRecalculateQCModalTitle,
      nzContent: tplRecalculateQCModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.recalculateQCModal.destroy();
      },
      nzOnOk: () => {
        this.recalculateQCQuantity( 
          workOrder,
          this.recalculateQCForm.controls.newQCQuantity.value,
          this.recalculateQCForm.controls.newQCPercentage.value,
        );
      },

      nzWidth: 1000,
    });
  }
    
  modifyWorkOrder(workOrder: WorkOrder) : void{

    this.router.navigateByUrl(`/work-order/work-order/maintenance?id=${workOrder.id}`);
  }

  
  printLPNReport(event: any, inventory: Inventory) {

    this.isSpinning = true;
    
    
    // console.log(`start to print lPN label for inventory \n${inventory}`);
    this.inventoryService.generateLPNLabel(
      inventory.lpn!, inventory.quantity, event.printerName)
      .subscribe(printResult => {

        // send the result to the printer
        const printFileUrl
          = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
        console.log(`will print file: ${printFileUrl}`);
        this.printingService.printFileByName(
          "LPN Label",
          printResult.fileName,
          // ReportType.LPN_LABEL,
          printResult.type,   // The report type may be LPN_LABEL , RECEIVING_LPN_LABEL or PRODUCTION_LINE_ASSIGNMENT_LABEL
          event.printerIndex,
          event.printerName,
          event.physicalCopyCount,
          PrintPageOrientation.Landscape,
          PrintPageSize.A4,
          inventory.location?.locationGroup?.name, 
          printResult);
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("report.print.printed"));
      },
        () => {
          this.isSpinning = false;
        },

      );

  }
  previewLPNReport(inventory: Inventory): void {


    this.isSpinning = true;
    this.inventoryService.generateLPNLabel(inventory.lpn!)
      .subscribe(printResult => {
        // console.log(`Print success! result: ${JSON.stringify(printResult)}`);
        this.isSpinning = false;
        this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.LANDSCAPE}`);

      },
        () => {
          this.isSpinning = false;
        },
      );
  }
}
