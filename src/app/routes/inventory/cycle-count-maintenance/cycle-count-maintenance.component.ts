import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { PrintPageSize } from '../../common/models/print-page-size.enum';
import { PrintingService } from '../../common/services/printing.service';
import { Receipt } from '../../inbound/models/receipt';
import { ReportOrientation } from '../../report/models/report-orientation.enum';
import { ReportType } from '../../report/models/report-type.enum';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { AuditCountRequest } from '../models/audit-count-request';
import { AuditCountResult } from '../models/audit-count-result';
import { CycleCountRequest } from '../models/cycle-count-request';
import { CycleCountRequestType } from '../models/cycle-count-request-type.enum';
import { CycleCountResult } from '../models/cycle-count-result';
import { Item } from '../models/item';
import { AuditCountRequestService } from '../services/audit-count-request.service';
import { AuditCountResultService } from '../services/audit-count-result.service';
import { CycleCountBatchService } from '../services/cycle-count-batch.service';
import { CycleCountRequestService } from '../services/cycle-count-request.service';
import { CycleCountResultService } from '../services/cycle-count-result.service';
import { ItemService } from '../services/item.service';


@Component({
    selector: 'app-inventory-cycle-count-maintenance',
    templateUrl: './cycle-count-maintenance.component.html',
    styleUrls: ['./cycle-count-maintenance.component.less'],
    standalone: false
})
export class InventoryCycleCountMaintenanceComponent implements OnInit {


  listOfOpenCycleCountTableColumns: Array<ColumnItem<CycleCountRequest>> = [
    {
      name: 'cycle-count.batchId',
      showSort: true,
      sortOrder: null,
      sortFn: (a: CycleCountRequest, b: CycleCountRequest) => a.batchId.localeCompare(b.batchId),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'location',
      showSort: true,
      sortOrder: null,
      sortFn: (a: CycleCountRequest, b: CycleCountRequest) => this.utilService.compareNullableObjField(a.location, b.location, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];

  listOfOpenCycleCountTableSelection = [
    {
      text: this.i18n.fanyi(`select-all-rows`),
      onSelect: () => {
        this.onOpenCycleCountTableAllChecked(true);
      }
    },
  ];
  setOfOpenCycleCountTableCheckedId = new Set<number>();
  openCycleCountTableChecked = false;
  openCycleCountTableIndeterminate = false;

  listOfCycleCountResultTableColumns: Array<ColumnItem<CycleCountResult>> = [
    {
      name: 'cycle-count.batchId',
      showSort: true,
      sortOrder: null,
      sortFn: (a: CycleCountResult, b: CycleCountResult) => this.utilService.compareNullableString(a.batchId, b.batchId),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },

    {
      name: 'location',
      showSort: true,
      sortOrder: null,
      sortFn: (a: CycleCountResult, b: CycleCountResult) => this.utilService.compareNullableObjField(a.location, b.location, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'item',
      showSort: true,
      sortOrder: null,
      sortFn: (a: CycleCountResult, b: CycleCountResult) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'item.description',
      showSort: true,
      sortOrder: null,
      sortFn: (a: CycleCountResult, b: CycleCountResult) => this.utilService.compareNullableObjField(a.item, b.item, 'description'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'quantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: CycleCountResult, b: CycleCountResult) => this.utilService.compareNullableNumber(a.quantity, b.quantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'count-quantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: CycleCountResult, b: CycleCountResult) => this.utilService.compareNullableNumber(a.countQuantity, b.countQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];

  listOfCancelledCycleCountTableColumns: Array<ColumnItem<CycleCountRequest>> = [
    {
      name: 'cycle-count.batchId',
      showSort: true,
      sortOrder: null,
      sortFn: (a: CycleCountRequest, b: CycleCountRequest) => a.batchId.localeCompare(b.batchId),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'location',
      showSort: true,
      sortOrder: null,
      sortFn: (a: CycleCountRequest, b: CycleCountRequest) => this.utilService.compareNullableObjField(a.location, b.location, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];

  listOfCancelledCycleCountTableSelection = [
    {
      text: this.i18n.fanyi(`select-all-rows`),
      onSelect: () => {
        this.onCancelledCycleCountTableAllChecked(true);
      }
    },
  ];
  setOfCancelledCycleCountTableCheckedId = new Set<number>();
  cancelledCycleCountTableChecked = false;
  cancelledCycleCountTableIndeterminate = false;


  listOfOpenAuditCountTableColumns: Array<ColumnItem<AuditCountRequest>> = [
    {
      name: 'cycle-count.batchId',
      showSort: true,
      sortOrder: null,
      sortFn: (a: AuditCountRequest, b: AuditCountRequest) => a.batchId.localeCompare(b.batchId),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'location',
      showSort: true,
      sortOrder: null,
      sortFn: (a: AuditCountRequest, b: AuditCountRequest) => this.utilService.compareNullableObjField(a.location, b.location, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];

  listOfOpenAuditCountTableSelection = [
    {
      text: this.i18n.fanyi(`select-all-rows`),
      onSelect: () => {
        this.onOpenAuditCountTableAllChecked(true);
      }
    },
  ];
  setOfOpenAuditCountTableCheckedId = new Set<number>();
  openAuditCountTableChecked = false;
  openAuditCountTableIndeterminate = false;

  listOfAuditCountResultsTableColumns: Array<ColumnItem<AuditCountResult>> = [
    {
      name: 'cycle-count.batchId',
      showSort: true,
      sortOrder: null,
      sortFn: (a: AuditCountResult, b: AuditCountResult) => this.utilService.compareNullableString(a.batchId, b.batchId),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },

    {
      name: 'location',
      showSort: true,
      sortOrder: null,
      sortFn: (a: AuditCountResult, b: AuditCountResult) => this.utilService.compareNullableObjField(a.location, b.location, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'lpn',
      showSort: true,
      sortOrder: null,
      sortFn: (a: AuditCountResult, b: AuditCountResult) => this.utilService.compareNullableString(a.lpn, b.lpn),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'item',
      showSort: true,
      sortOrder: null,
      sortFn: (a: AuditCountResult, b: AuditCountResult) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'item.description',
      showSort: true,
      sortOrder: null,
      sortFn: (a: AuditCountResult, b: AuditCountResult) => this.utilService.compareNullableObjField(a.item, b.item, 'description'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'quantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: AuditCountResult, b: AuditCountResult) => this.utilService.compareNullableNumber(a.quantity, b.quantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'count-quantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: AuditCountResult, b: AuditCountResult) => this.utilService.compareNullableNumber(a.countQuantity, b.countQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];


  requestForm!: UntypedFormGroup;
  pageTitle: string;

  availableRequestType = CycleCountRequestType;
  cycleCountRequestType!: CycleCountRequestType;

  listOfDisplayOpenCycleCountRequests: CycleCountRequest[] = [];
  listOfAllOpenCycleCountRequests: CycleCountRequest[] = [];
  listOfDisplayCycleCountResults: CycleCountResult[] = [];
  listOfAllCycleCountResults: CycleCountResult[] = [];
  listOfDisplayCancelledCycleCountRequests: CycleCountRequest[] = [];
  listOfAllCancelledCycleCountRequests: CycleCountRequest[] = [];
  listOfDisplayOpenAuditCountRequests: AuditCountRequest[] = [];
  listOfAllOpenAuditCountRequests: AuditCountRequest[] = [];
  listOfDisplayAuditCountResults: AuditCountResult[] = [];
  listOfAllAuditCountResults: AuditCountResult[] = [];


  // indicator for detail informaiton loading in process
  // we will load 5 different detail informations asyncronize
  // during loading, we will show the loading controller(isSpinning = true)
  // once we finished loading, we will hide the loading indicator contorller
  // and return the control to the user
  loadingInProcess: number[] = [];

  // Model to let the user input cycle count result
  inventoriesToBeCount: CycleCountResult[] = [];

  cycleCountRequestConfirmModal!: NzModalRef;
  tabSelectedIndex = 0;
  newBatch = false;


  printingCycleCountRequest = false;

  printCycleCountType = "all";
  printAuditCountType = "all";

  isSpinning = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private fb: UntypedFormBuilder,
    private cycleCountBatchService: CycleCountBatchService,
    private cycleCountRequestService: CycleCountRequestService,
    private cycleCountResulttService: CycleCountResultService,
    private auditCountRequestService: AuditCountRequestService,
    private auditCountResultService: AuditCountResultService,
    private modalService: NzModalService,
    private itemService: ItemService,
    private message: NzMessageService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private utilService: UtilService,
    private printingService: PrintingService,
    private router: Router,
  ) {
    this.pageTitle = this.i18n.fanyi('page.inventory.cycle-count-request.title');
  }

  ngOnInit(): void {


    this.titleService.setTitle(this.i18n.fanyi('page.inventory.cycle-count-request.title'));

    this.requestForm = this.fb.group({
      batchId: ['', Validators.required],
      requestType: ['', Validators.required],
      startValue: [null],
      endValue: [null],
      includeEmptyLocation: [null],
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.batchId) {
        this.requestForm.controls.batchId.setValue(params.batchId);
        this.requestForm.controls.batchId.disable();
        this.newBatch = false;
      }
      else {
        this.newBatch = true;
      }
      this.refreshCountBatchResults();

      if (params.from === 'auditConfirm') {
        // If we are comes from audit confirm, then we will show 'Audot Confirmed'
        // tab
        this.tabSelectedIndex = 4;
      } else {
        this.tabSelectedIndex = 0;
      }
    });
  }

  generateBatchId(): void {
    if (this.requestForm.controls.autoGenerateId.value) {
      this.requestForm.controls.batchId.disable();
      if (!this.requestForm.controls.batchId.value) {
        this.cycleCountBatchService.getNextCycleCountBatchId().subscribe(nextId => {
          this.requestForm.controls.batchId.setValue(nextId);
        });
      }
    } else {
      this.requestForm.controls.batchId.enable();
    }
  }
  requestTypeChange(newRequestType: CycleCountRequestType): void {
    this.cycleCountRequestType = newRequestType;
  }

  generateCountRequest(): void {
    this.isSpinning = true;
    this.cycleCountRequestService
      .generateCycleCountRequests(
        this.requestForm.controls.batchId.value,
        this.cycleCountRequestType,
        this.requestForm.controls.startValue.value,
        this.requestForm.controls.endValue.value,
        this.requestForm.controls.includeEmptyLocation.value,
      )
      .subscribe(res => {
        this.requestForm.controls.startValue.reset();
        this.requestForm.controls.endValue.reset();
        this.requestForm.controls.includeEmptyLocation.reset();
        this.message.info(this.i18n.fanyi('message.new.complete'));
        if (this.newBatch) {
          // refresh the page by going to the same page, with
          // batch id in the parameter
          this.router.navigateByUrl(`/inventory/count/cycle-count-maintenance?batchId=${this.requestForm.controls.batchId.value}`);
        }
        else {

          this.refreshCountBatchResults();
          this.requestForm.controls.batchId.disable();
          this.isSpinning = false;
        }
      },
        () => { this.isSpinning = true });
  }
  batchIdOnBlur(event: Event): void {
    // When we use the 'fkey' to automatically generate the next cycle count id
    // the reactive form control may not have the right value.Let's set
    // the number back to the bind control
    this.requestForm.controls.batchId.setValue((event.target as HTMLInputElement).value);
    this.refreshCountBatchResults();
  }

  refreshCountBatchResults(): void {

    // we have 5 tables to load, init all fo them to 0 means
    // we haven't load them yet
    // once we finished one table, the correpondent 0 will 
    // be set to 1
    const batchId = this.requestForm.controls.batchId.value;
    if (batchId) {
      this.isSpinning = true;
      this.loadingInProcess = [0, 0, 0, 0, 0];
      this.loadOpenCycleCountRequest(batchId);
      this.loadFinishedCycleCountRequest(batchId);
      this.loadCancelledCycleCountRequest(batchId);
      this.loadOpenAuditCountRequest(batchId);
      this.loadAuditCountResult(batchId);
    }
  }

  tableLoadingComplete(index: number) {

    this.loadingInProcess[index] = 1;
    if (this.loadingInProcess.indexOf(0) < 0) {

      // all tables are either loaded , or errored
      // let's hide the loading in process controller

      this.isSpinning = false;
    }
  }
  loadOpenCycleCountRequest(batchId: string): void {
    this.loadingInProcess[0] = 0;

    this.cycleCountRequestService.getOpenCycleCountRequestDetails(batchId, true).subscribe(res => {
      this.listOfAllOpenCycleCountRequests = res;
      this.listOfDisplayOpenCycleCountRequests = res;
      this.tableLoadingComplete(0);
    },
      () => {
        this.tableLoadingComplete(0);
      });
  }
  loadFinishedCycleCountRequest(batchId: string): void {
    this.cycleCountResulttService.getCycleCountResultDetails(batchId, true).subscribe(res => {
      this.listOfAllCycleCountResults = res;
      this.listOfDisplayCycleCountResults = res;
      this.tableLoadingComplete(1);
    },
      () => {
        this.tableLoadingComplete(1);
      });
  }
  loadCancelledCycleCountRequest(batchId: string): void {
    this.cycleCountRequestService.getCancelledCycleCountRequestDetails(batchId, true).subscribe(res => {
      this.listOfAllCancelledCycleCountRequests = res;
      this.listOfDisplayCancelledCycleCountRequests = res;

      this.tableLoadingComplete(2);
    },
      () => {
        this.tableLoadingComplete(2);
      });
  }
  loadOpenAuditCountRequest(batchId: string): void {
    this.auditCountRequestService.getAuditCountRequestDetails(batchId, true).subscribe(res => {
      this.listOfAllOpenAuditCountRequests = res;
      this.listOfDisplayOpenAuditCountRequests = res;

      this.tableLoadingComplete(3);
    },
      () => {
        this.tableLoadingComplete(3);
      });
  }
  loadAuditCountResult(batchId: string): void {
    this.auditCountResultService.getAuditCountResultDetails(batchId, true).subscribe(res => {
      this.listOfAllAuditCountResults = res;
      this.listOfDisplayAuditCountResults = res;

      this.tableLoadingComplete(4);
    },
      () => {
        this.tableLoadingComplete(4);
      });
  }

  /**
   * Open Cycle Count Table event and attribute
   * > Sort
   * > select / select all
   * > confirm / confirm all
   * > print report / print report for all
   * > input result
   */

  openCycleCountCurrentPageDataChange($event: CycleCountRequest[]): void {
    this.listOfDisplayOpenCycleCountRequests = $event;
    this.refreshOpenCycleCountTableCheckedStatus();
  }

  updateOpenCycleCountTableCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfOpenCycleCountTableCheckedId.add(id);
    } else {
      this.setOfOpenCycleCountTableCheckedId.delete(id);
    }
  }

  onOpenCycleCountTableItemChecked(id: number, checked: boolean): void {
    this.updateOpenCycleCountTableCheckedSet(id, checked);
    this.refreshOpenCycleCountTableCheckedStatus();
  }

  onOpenCycleCountTableAllChecked(value: boolean): void {
    this.listOfDisplayOpenCycleCountRequests!.forEach(item => this.updateOpenCycleCountTableCheckedSet(item.id, value));
    this.refreshOpenCycleCountTableCheckedStatus();
  }


  refreshOpenCycleCountTableCheckedStatus(): void {
    this.openCycleCountTableChecked = this.listOfDisplayOpenCycleCountRequests!.every(item => this.setOfOpenCycleCountTableCheckedId.has(item.id));
    this.openCycleCountTableIndeterminate = this.listOfDisplayOpenCycleCountRequests!.some(item => this.setOfOpenCycleCountTableCheckedId.has(item.id))
      && !this.openCycleCountTableChecked;
  }

  getSelectedOpenCycleCounts(): CycleCountRequest[] {
    const selectedOpenCycleCounts: CycleCountRequest[] = [];
    this.listOfAllOpenCycleCountRequests.forEach((cycleCountRequest: CycleCountRequest) => {
      if (this.setOfOpenCycleCountTableCheckedId.has(cycleCountRequest.id)) {
        selectedOpenCycleCounts.push(cycleCountRequest);
      }
    });
    return selectedOpenCycleCounts;
  }

  confirmSelectedCycleCounts(): void {
    this.cycleCountRequestService.confirmCycleCountRequests(this.getSelectedOpenCycleCounts()).subscribe(res => {
      this.refreshCountBatchResults();
    });
  }

  confirmAllCycleCounts(): void {
    this.cycleCountRequestService.confirmCycleCountRequests(this.listOfAllOpenCycleCountRequests).subscribe(res => {
      this.refreshCountBatchResults();
    });
  }
  /***
   * 
  
    printSelectedCycleCounts(): void {
      this.cycleCountRequestService.printCycleCountRequestReport(
        this.requestForm.controls.batchId.value,
        this.getSelectedOpenCycleCounts(),
      );
    }
  
    printAllCycleCounts(): void {
      this.printingCycleCountRequest = true;
      this.cycleCountRequestService.printCycleCountRequestReport(
        this.requestForm.controls.batchId.value,
        this.listOfAllOpenCycleCountRequests,
      );
      setTimeout(() => {
        this.printingCycleCountRequest = false;
      }, 1000);
    }
   */

  cancelSelectedCycleCounts(): void {
    this.isSpinning = true;
    this.cycleCountRequestService
      .cancelCycleCountRequests(this.getSelectedOpenCycleCounts())
      .subscribe(res => {
        this.refreshCountBatchResults();
      },
        () => { this.isSpinning = false; });
  }
  openCountResultModal(
    cycleCountRequest: CycleCountRequest,
    tplCycleCountRequestConfirmModalTitle: TemplateRef<{}>,
    tplCycleCountRequestConfirmModalContent: TemplateRef<{}>,
  ): void {
    // Get all inventory, allow the user to input quantity
    this.cycleCountRequestService.getInventorySummariesForCount(cycleCountRequest).subscribe(inventorySummaries => {
      this.inventoriesToBeCount = inventorySummaries;

      // show the model
      this.cycleCountRequestConfirmModal = this.modalService.create({
        nzTitle: tplCycleCountRequestConfirmModalTitle,
        nzContent: tplCycleCountRequestConfirmModalContent,
        nzOkText: this.i18n.fanyi('confirm'),
        nzCancelText: this.i18n.fanyi('cancel'),
        nzMaskClosable: false,
        nzOnCancel: () => {
          this.cycleCountRequestConfirmModal.destroy();
          this.refreshCountBatchResults();
        },
        nzOnOk: () => {
          this.saveCycleCountResults(cycleCountRequest, this.inventoriesToBeCount);
        },
        nzWidth: 1000,
      });
    });
  }

  countResultItemNameBlur(event: Event, cycleCountResult: CycleCountResult): void {
    const itemName: string = (event.target as HTMLInputElement).value;
    // Load the item informaiton when the name is changed
    if (itemName !== cycleCountResult.item!.name) {
      if (itemName.length === 0) {
        // item is chagned to empty, let's clear the item
        cycleCountResult.item = this.getEmptyItem();
      } else {
        this.itemService.getItems(itemName).subscribe(items => {
          // we should only get one item based on the name
          cycleCountResult.item = items.length > 0 ? items[0] : this.getEmptyItem();
        });
      }
    }
  }

  saveCycleCountResults(cycleCountRequest: CycleCountRequest, cycleCountResults: CycleCountResult[]): void {
    this.cycleCountRequestService
      .saveCycleCountResults(cycleCountRequest, this.setupCycleCountResults(cycleCountResults))
      .subscribe(res => this.refreshCountBatchResults());
  }
  setupCycleCountResults(cycleCountResults: CycleCountResult[]): CycleCountResult[] {
    // We will loop through each cycle count result to make sure
    // 1. if this is count as a empty location, then there's only one result with no item informaiton
    // 2. If this is not count as a empty location, then there's no result with null item information

    const emptyLocation = !cycleCountResults.some(
      cycleCountResult =>
        cycleCountResult.item != null && cycleCountResult.item.name != null && cycleCountResult.item.name.length > 0,
    );

    if (emptyLocation) {
      // for empty location, let's make sure we only have one cycle count result with null item
      const emptyCycleCountResult = this.getEmptyCycleCountResult();
      emptyCycleCountResult.batchId = cycleCountResults[0].batchId;
      emptyCycleCountResult.location = cycleCountResults[0].location;
      emptyCycleCountResult.warehouseId = cycleCountResults[0].warehouseId;
      return [emptyCycleCountResult];
    } else {
      // This is not an empty location, let's remove all lines that has empty locations.
      const nonEmptyCycleCountResults: CycleCountResult[] = [];
      cycleCountResults.forEach(cycleCountResult => {
        if (
          cycleCountResult.item != null &&
          cycleCountResult.item.name != null &&
          cycleCountResult.item.name.length > 0
        ) {
          nonEmptyCycleCountResults.push(cycleCountResult);
        }
      });

      return nonEmptyCycleCountResults;
    }
  }

  /**
   * Add or remove inventory from cycle count result
   */
  addCountedInventory(inventorySummary: CycleCountResult): void {
    if (inventorySummary.item == null) {
      // Ok, we are try to add inventory to an empty location, let's add an empty item information
      // so the user can start to count with the actual inventory in the location
      inventorySummary.item = this.getEmptyItem();
    } else {
      const extraCycleCountResult = this.getEmptyCycleCountResult();
      extraCycleCountResult.item = this.getEmptyItem();
      extraCycleCountResult.batchId = inventorySummary.batchId;
      extraCycleCountResult.location = inventorySummary.location;
      extraCycleCountResult.warehouseId = inventorySummary.warehouseId;
      // Add an empty count result

      this.inventoriesToBeCount = [...this.inventoriesToBeCount, extraCycleCountResult];
      console.log(
        `After added, we got the following inventories to be count \n ${JSON.stringify(this.inventoriesToBeCount)}`,
      );
    }
  }

  removeCountedInventory(index: number): void {
    // If this is a the last item in this location, we will
    // create an empty structure with the same batch id
    // and location, just to count this location as an empty location
    if (this.inventoriesToBeCount.length === 1) {
      const extraCycleCountResult = this.getEmptyCycleCountResult();
      extraCycleCountResult.batchId = this.inventoriesToBeCount[index].batchId;
      extraCycleCountResult.location = this.inventoriesToBeCount[index].location;
      // Remove the current item at the index
      this.inventoriesToBeCount = this.inventoriesToBeCount.filter((item, i) => i !== index);

      // Add an empty count result
      this.inventoriesToBeCount = [...this.inventoriesToBeCount, extraCycleCountResult];
    } else {
      this.inventoriesToBeCount = this.inventoriesToBeCount.filter((item, i) => i !== index);
    }
  }

  getEmptyItem(): Item {
    return {
      id: undefined,
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      companyId: this.companyService.getCurrentCompany()!.id,
      name: '',
      description: '',
      client: undefined,
      itemFamily: undefined,
      itemPackageTypes: [],
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
    };
  }

  getEmptyCycleCountResult(): CycleCountResult {
    return {
      id: undefined,
      batchId: undefined,
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      location: undefined,
      item: undefined,
      quantity: 0,
      countQuantity: 0,
      auditCountRequest: undefined,
    };
  }
  /**
   * Cycle count result event and attribute
   * > Sort
   */
  cycleCountResultPageDataChange($event: CycleCountResult[]): void {
    this.listOfDisplayCycleCountResults = $event;
  }

  sortCycleCountResultTable(sort: { key: string; value: string }): void {
  }

  /**
   * Cancelled Cycle Count Table event and attribute
   * > Sort
   * > select / select all
   * > reopen select / reopen all
   */

  cancelledCycleCountCurrentPageDataChange($event: CycleCountRequest[]): void {
    this.listOfDisplayCancelledCycleCountRequests = $event;
    this.refreshCancelledCycleCountTableCheckedStatus();
  }

  updateCancelledCycleCountTableCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCancelledCycleCountTableCheckedId.add(id);
    } else {
      this.setOfCancelledCycleCountTableCheckedId.delete(id);
    }
  }

  onCancelledCycleCountTableItemChecked(id: number, checked: boolean): void {
    this.updateCancelledCycleCountTableCheckedSet(id, checked);
    this.refreshCancelledCycleCountTableCheckedStatus();
  }

  onCancelledCycleCountTableAllChecked(value: boolean): void {
    this.listOfDisplayCancelledCycleCountRequests!.forEach(item => this.updateCancelledCycleCountTableCheckedSet(item.id, value));
    this.refreshCancelledCycleCountTableCheckedStatus();
  }


  refreshCancelledCycleCountTableCheckedStatus(): void {
    this.cancelledCycleCountTableChecked = this.listOfDisplayCancelledCycleCountRequests!.every(item => this.setOfCancelledCycleCountTableCheckedId.has(item.id));
    this.cancelledCycleCountTableIndeterminate = this.listOfDisplayCancelledCycleCountRequests!.some(item => this.setOfCancelledCycleCountTableCheckedId.has(item.id))
      && !this.cancelledCycleCountTableChecked;
  }

  getSelectedCancelledCycleCounts(): CycleCountRequest[] {
    const selectedCancelledCycleCounts: CycleCountRequest[] = [];
    this.listOfAllCancelledCycleCountRequests.forEach((cycleCountRequest: CycleCountRequest) => {
      if (this.setOfCancelledCycleCountTableCheckedId.has(cycleCountRequest.id)) {
        selectedCancelledCycleCounts.push(cycleCountRequest);
      }
    });
    return selectedCancelledCycleCounts;
  }
  reopenCancelledCycleCountRequest(): void {
    this.cycleCountRequestService
      .reopenCancelledCycleCountRequests(this.getSelectedCancelledCycleCounts())
      .subscribe(res => this.refreshCountBatchResults());
  }

  /**
   * Open Audit Count Table event and attribute
   * > Sort
   * > select / select all
   * > confirm / confirm all
   * > print report / print report for all
   */

  openAuditCountCurrentPageDataChange($event: AuditCountRequest[]): void {
    this.listOfDisplayOpenAuditCountRequests = $event;
    this.refreshOpenAuditCountTableCheckedStatus();
  }

  updateOpenAuditCountTableCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfOpenAuditCountTableCheckedId.add(id);
    } else {
      this.setOfOpenAuditCountTableCheckedId.delete(id);
    }
  }

  onOpenAuditCountTableItemChecked(id: number, checked: boolean): void {
    this.updateOpenAuditCountTableCheckedSet(id, checked);
    this.refreshOpenAuditCountTableCheckedStatus();
  }

  onOpenAuditCountTableAllChecked(value: boolean): void {
    this.listOfDisplayOpenAuditCountRequests!.forEach(item => this.updateOpenAuditCountTableCheckedSet(item.id, value));
    this.refreshOpenAuditCountTableCheckedStatus();
  }


  refreshOpenAuditCountTableCheckedStatus(): void {
    this.openAuditCountTableChecked = this.listOfDisplayOpenAuditCountRequests!.every(item => this.setOfOpenAuditCountTableCheckedId.has(item.id));
    this.openAuditCountTableIndeterminate = this.listOfDisplayOpenAuditCountRequests!.some(item => this.setOfOpenAuditCountTableCheckedId.has(item.id))
      && !this.openAuditCountTableChecked;
  }


  getSelectedOpenAuditCounts(): AuditCountRequest[] {
    const selectedOpenAuditCounts: AuditCountRequest[] = [];
    this.listOfAllOpenAuditCountRequests.forEach((auditCountRequest: AuditCountRequest) => {
      if (this.setOfOpenAuditCountTableCheckedId.has(auditCountRequest.id)) {
        selectedOpenAuditCounts.push(auditCountRequest);
      }
    });
    return selectedOpenAuditCounts;
  }

  confirmSelectedAuditCounts(): void {
    this.auditCountRequestService.confirmAuditCountRequests(this.getSelectedOpenAuditCounts()).subscribe(res => {
      this.refreshCountBatchResults();
    });
  }

  confirmAllAuditCounts(): void {
    this.auditCountRequestService.confirmAuditCountRequests(this.listOfAllOpenAuditCountRequests).subscribe(res => {
      this.refreshCountBatchResults();
    });
  }


  /**
   * Cycle count result event and attribute
   * > Sort
   */
  auditCountResultsCurrentPageDataChange($event: AuditCountResult[]): void {
    this.listOfDisplayAuditCountResults = $event;
  }

  sortAuditCountResultsTable(sort: { key: string; value: string }): void {

  }

  processStartValueQueryResult(selectedStartValue: any): void {
    this.requestForm.controls.startValue.setValue(selectedStartValue);
  }
  processEndValueQueryResult(selectedEndValue: any): void {
    this.requestForm.controls.endValue.setValue(selectedEndValue);
  }

  /**
   * Print or preview cycle count sheet
   * 
   */
  printCycleCounts(event: any) {

    switch (this.printCycleCountType) {
      case "all":
        this.printAllCycleCount(event);
        break;

      case "selected":
        this.printSelectedCycleCount(event);
        break;
      default:
        this.printAllCycleCount(event);
        break;
    }
  }

  previewCycleCounts() {

    switch (this.printCycleCountType) {
      case "all":
        this.previewAllCycleCount();
        break;

      case "selected":
        this.previewSelectedCycleCount();
        break;
      default:
        this.previewAllCycleCount();
        break;
    }
  }

  printCycleCountSheet(event: any, cycleCountRequestIds: number[]): void {
    this.isSpinning = true;
    console.log(`start to print cycle count sheet for batch: ${this.requestForm.controls.batchId} `);

    this.cycleCountRequestService.printCycleCountSheet(
      this.requestForm.controls.batchId.value,
      cycleCountRequestIds,
      this.i18n.currentLang)
      .subscribe(printResult => {

        // send the result to the printer
        this.printingService.printFileByName(
          "Cycle Count Sheet",
          printResult.fileName,
          ReportType.CYCLE_COUNT_SHEET,
          event.printerIndex,
          event.printerName,
          event.physicalCopyCount, PrintPageOrientation.Landscape,
          PrintPageSize.A4,
          this.requestForm.controls.batchId.value, 
          printResult, event.collated);
        this.isSpinning = false;
        this.message.success(this.i18n.fanyi("report.print.printed"));
      },
        () => {
          this.isSpinning = false;
        },

      );
  }

  previewCycleCountSheet(cycleCountRequestIds: number[]): void {

    this.isSpinning = true;
    console.log(`start to preview cycle count sheet for batch: ${this.requestForm.controls.batchId} `);

    this.cycleCountRequestService.printCycleCountSheet(
      this.requestForm.controls.batchId.value,
      cycleCountRequestIds,
      this.i18n.currentLang)
      .subscribe(printResult => {
        this.isSpinning = false;
        sessionStorage.setItem("report_previous_page", `inventory/count/cycle-count-maintenance?batchId=${this.requestForm.controls.batchId.value}`);
        this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.LANDSCAPE}`);

      },
        () => {
          this.isSpinning = false;
        },

      );

  }


  printSelectedCycleCount(event: any): void {
    let selectedCycleCount = this.getSelectedOpenCycleCounts().map(
      cycleCount => cycleCount.id!
    );
    this.printCycleCountSheet(event, selectedCycleCount);
  }
  previewSelectedCycleCount(): void {
    let selectedCycleCount = this.getSelectedOpenCycleCounts().map(
      cycleCount => cycleCount.id!
    );
    this.previewCycleCountSheet(selectedCycleCount);
  }

  printAllCycleCount(event: any): void {
    this.printCycleCountSheet(event, []);

  }
  previewAllCycleCount(): void {
    this.previewCycleCountSheet([]);
  }


  /**
   * Print or preview audit count sheet
   * 
   */
  printAuditCounts(event: any) {

    switch (this.printAuditCountType) {
      case "all":
        this.printAllAuditCount(event);
        break;

      case "selected":
        this.printSelectedAuditCount(event);
        break;
      default:
        this.printAllAuditCount(event);
        break;
    }
  }

  previewAuditCounts() {

    switch (this.printAuditCountType) {
      case "all":
        this.previewAllAuditCount();
        break;

      case "selected":
        this.previewSelectedAuditCount();
        break;
      default:
        this.previewAllAuditCount();
        break;
    }
  }

  printAuditCountSheet(event: any, auditCountRequestIds: number[]): void {
    this.isSpinning = true;
    console.log(`start to print Audit count sheet for batch: ${this.requestForm.controls.batchId} `);

    this.auditCountRequestService.printAuditCountSheet(
      this.requestForm.controls.batchId.value,
      auditCountRequestIds,
      this.i18n.currentLang)
      .subscribe(printResult => {

        // send the result to the printer
        this.printingService.printFileByName(
          "Audit Count Sheet",
          printResult.fileName,
          ReportType.AUDIT_COUNT_SHEET,
          event.printerIndex,
          event.printerName,
          event.physicalCopyCount, PrintPageOrientation.Landscape,
          PrintPageSize.A4,
          this.requestForm.controls.batchId.value, 
          printResult, event.collated);
        this.isSpinning = false;
        this.message.success(this.i18n.fanyi("report.print.printed"));
      },
        () => {
          this.isSpinning = false;
        },

      );
  }

  previewAuditCountSheet(auditCountRequestIds: number[]): void {

    this.isSpinning = true;
    console.log(`start to preview audit count sheet for batch: ${this.requestForm.controls.batchId} `);

    this.auditCountRequestService.printAuditCountSheet(
      this.requestForm.controls.batchId.value,
      auditCountRequestIds,
      this.i18n.currentLang)
      .subscribe(printResult => {
        this.isSpinning = false;
        sessionStorage.setItem("report_previous_page", `inventory/count/cycle-count-maintenance?batchId=${this.requestForm.controls.batchId.value}`);
        this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.LANDSCAPE}`);

      },
        () => {
          this.isSpinning = false;
        },

      );

  }


  printSelectedAuditCount(event: any): void {
    let selectedAuditCount = this.getSelectedOpenAuditCounts().map(
      auditCount => auditCount.id!
    );
    this.printAuditCountSheet(event, selectedAuditCount);
  }
  previewSelectedAuditCount(): void {
    let selectedAuditCount = this.getSelectedOpenAuditCounts().map(
      auditCount => auditCount.id!
    );
    this.previewAuditCountSheet(selectedAuditCount);
  }

  printAllAuditCount(event: any): void {
    this.printAuditCountSheet(event, []);

  }
  previewAllAuditCount(): void {
    this.previewAuditCountSheet([]);
  }

}
