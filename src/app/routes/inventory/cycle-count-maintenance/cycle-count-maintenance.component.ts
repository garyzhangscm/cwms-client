import { Component, OnInit, TemplateRef } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { CycleCountRequestType } from '../models/cycle-count-request-type.enum';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CycleCountBatchService } from '../services/cycle-count-batch.service';
import { CycleCountRequest } from '../models/cycle-count-request';
import { CycleCountResult } from '../models/cycle-count-result';
import { AuditCountRequest } from '../models/audit-count-request';
import { AuditCountResult } from '../models/audit-count-result';
import { CycleCountRequestService } from '../services/cycle-count-request.service';
import { CycleCountResultService } from '../services/cycle-count-result.service';
import { AuditCountRequestService } from '../services/audit-count-request.service';
import { AuditCountResultService } from '../services/audit-count-result.service';
import { NzModalRef, NzModalService, NzMessageService } from 'ng-zorro-antd';
import { Item } from '../models/item';
import { ItemService } from '../services/item.service';

@Component({
  selector: 'app-inventory-cycle-count-maintenance',
  templateUrl: './cycle-count-maintenance.component.html',
})
export class InventoryCycleCountMaintenanceComponent implements OnInit {
  requestForm: FormGroup;
  pageTitle: string;

  availableRequestType = CycleCountRequestType;
  cycleCountRequestType: CycleCountRequestType;

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

  // control for table of open cycle count request
  // checkbox - select all
  openCycleCountTableAllChecked = false;
  openCycleCountTableIndeterminate = false;
  // list of checked checkbox
  openCycleCountTableMapOfCheckedId: { [key: string]: boolean } = {};

  // Model to let the user input cycle count result
  inventoriesToBeCount: CycleCountResult[] = [];

  cycleCountRequestConfirmModal: NzModalRef;
  tabSelectedIndex = 0;
  // control for table of cancelled cycle count request
  // checkbox - select all
  cancelledCycleCountTableAllChecked = false;
  cancelledCycleCountTableIndeterminate = false;
  // list of checked checkbox
  cancelledCycleCountTableMapOfCheckedId: { [key: string]: boolean } = {};

  // control for table of open audit count request
  // checkbox - select all
  openAuditCountTableAllChecked = false;
  openAuditCountTableIndeterminate = false;
  // list of checked checkbox
  openAuditCountTableMapOfCheckedId: { [key: string]: boolean } = {};

  printingCycleCountRequest = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private i18n: I18NService,
    private titleService: TitleService,
    private fb: FormBuilder,
    private cycleCountBatchService: CycleCountBatchService,
    private cycleCountRequestService: CycleCountRequestService,
    private cycleCountResulttService: CycleCountResultService,
    private auditCountRequestService: AuditCountRequestService,
    private auditCountResultService: AuditCountResultService,
    private modalService: NzModalService,
    private itemService: ItemService,
    private message: NzMessageService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.inventory.cycle-count-request.title');
  }

  ngOnInit() {
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

  generateBatchId() {
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
  requestTypeChange(newRequestType) {
    this.cycleCountRequestType = newRequestType;
  }

  generateCountRequest() {
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
        this.refreshCountBatchResults();
        this.requestForm.controls.batchId.disable();
      });
  }
  batchIdOnBlur(batchId?: string) {
    // When we use the 'fkey' to automatically generate the next cycle count id
    // the reactive form control may not have the right value.Let's set
    // the number back to the bind control
    this.requestForm.controls.batchId.setValue(batchId);
    this.refreshCountBatchResults();
  }

  refreshCountBatchResults() {
    const batchId = this.requestForm.controls.batchId.value;
    if (batchId) {
      this.loadOpenCycleCountRequest(batchId);
      this.loadFinishedCycleCountRequest(batchId);
      this.loadCancelledCycleCountRequest(batchId);
      this.loadOpenAuditCountRequest(batchId);
      this.loadAuditCountResult(batchId);
    }
  }

  loadOpenCycleCountRequest(batchId: string) {
    this.cycleCountRequestService.getOpenCycleCountRequestDetails(batchId, true).subscribe(res => {
      this.listOfAllOpenCycleCountRequests = res;
      this.listOfDisplayOpenCycleCountRequests = res;
    });
  }
  loadFinishedCycleCountRequest(batchId: string) {
    this.cycleCountResulttService.getCycleCountResultDetails(batchId, true).subscribe(res => {
      this.listOfAllCycleCountResults = res;
      this.listOfDisplayCycleCountResults = res;
    });
  }
  loadCancelledCycleCountRequest(batchId: string) {
    this.cycleCountRequestService.getCancelledCycleCountRequestDetails(batchId, true).subscribe(res => {
      this.listOfAllCancelledCycleCountRequests = res;
      this.listOfDisplayCancelledCycleCountRequests = res;
    });
  }
  loadOpenAuditCountRequest(batchId: string) {
    this.auditCountRequestService.getAuditCountRequestDetails(batchId, true).subscribe(res => {
      this.listOfAllOpenAuditCountRequests = res;
      this.listOfDisplayOpenAuditCountRequests = res;
    });
  }
  loadAuditCountResult(batchId: string) {
    this.auditCountResultService.getAuditCountResultDetails(batchId, true).subscribe(res => {
      this.listOfAllAuditCountResults = res;
      this.listOfDisplayAuditCountResults = res;
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
    this.openCycleCountTableRefreshStatus();
  }

  openCycleCountTableRefreshStatus(): void {
    this.openCycleCountTableAllChecked = this.listOfDisplayOpenCycleCountRequests.every(
      item => this.openCycleCountTableMapOfCheckedId[item.id],
    );
    this.openCycleCountTableIndeterminate =
      this.listOfDisplayOpenCycleCountRequests.some(item => this.openCycleCountTableMapOfCheckedId[item.id]) &&
      !this.openCycleCountTableAllChecked;
  }

  openCycleCountTableCheckAll(value: boolean): void {
    this.listOfDisplayOpenCycleCountRequests.forEach(item => (this.openCycleCountTableMapOfCheckedId[item.id] = value));
    this.openCycleCountTableRefreshStatus();
  }

  sortOpenCycleCountRequestTable(sort: { key: string; value: string }): void {
    if (sort.key && sort.value) {
      this.listOfDisplayOpenCycleCountRequests = this.listOfAllOpenCycleCountRequests.sort((a, b) =>
        sort.value === 'ascend' ? (a[sort.key!] > b[sort.key!] ? 1 : -1) : b[sort.key!] > a[sort.key!] ? 1 : -1,
      );
    } else {
      this.listOfDisplayOpenCycleCountRequests = this.listOfAllOpenCycleCountRequests;
    }
  }

  getSelectedOpenCycleCounts(): CycleCountRequest[] {
    const selectedOpenCycleCounts: CycleCountRequest[] = [];
    this.listOfAllOpenCycleCountRequests.forEach((cycleCountRequest: CycleCountRequest) => {
      if (this.openCycleCountTableMapOfCheckedId[cycleCountRequest.id] === true) {
        selectedOpenCycleCounts.push(cycleCountRequest);
      }
    });
    return selectedOpenCycleCounts;
  }

  confirmSelectedCycleCounts() {
    this.cycleCountRequestService.confirmCycleCountRequests(this.getSelectedOpenCycleCounts()).subscribe(res => {
      this.refreshCountBatchResults();
    });
  }

  confirmAllCycleCounts() {
    this.cycleCountRequestService.confirmCycleCountRequests(this.listOfAllOpenCycleCountRequests).subscribe(res => {
      this.refreshCountBatchResults();
    });
  }

  printSelectedCycleCounts() {
    this.cycleCountRequestService.printCycleCountRequestReport(
      this.requestForm.controls.batchId.value,
      this.getSelectedOpenCycleCounts(),
    );
  }

  printAllCycleCounts() {
    this.printingCycleCountRequest = true;
    this.cycleCountRequestService.printCycleCountRequestReport(
      this.requestForm.controls.batchId.value,
      this.listOfAllOpenCycleCountRequests,
    );
    setTimeout(() => {
      this.printingCycleCountRequest = false;
    }, 1000);
  }

  cancelSelectedCycleCounts() {
    this.cycleCountRequestService.cancelCycleCountRequests(this.getSelectedOpenCycleCounts()).subscribe(res => {
      this.refreshCountBatchResults();
    });
  }
  openCountResultModal(
    cycleCountRequest: CycleCountRequest,
    tplCycleCountRequestConfirmModalTitle: TemplateRef<{}>,
    tplCycleCountRequestConfirmModalContent: TemplateRef<{}>,
  ) {
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

  countResultItemNameBlur(itemName: string, cycleCountResult: CycleCountResult) {
    // Load the item informaiton when the name is changed
    if (itemName !== cycleCountResult.item.name) {
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

  saveCycleCountResults(cycleCountRequest: CycleCountRequest, cycleCountResults: CycleCountResult[]) {
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
  addCountedInventory(inventorySummary: CycleCountResult) {
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

  removeCountedInventory(index: number) {
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
      id: null,
      name: '',
      description: '',
      client: null,
      itemFamily: null,
      itemPackageTypes: null,
      unitCost: null,
    };
  }

  getEmptyCycleCountResult(): CycleCountResult {
    return {
      id: null,
      batchId: null,
      warehouseId: null,
      location: null,
      item: null,
      quantity: 0,
      countQuantity: 0,
      auditCountRequest: null,
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
    if (sort.key && sort.value) {
      this.listOfDisplayCycleCountResults = this.listOfAllCycleCountResults.sort((a, b) =>
        sort.value === 'ascend' ? (a[sort.key!] > b[sort.key!] ? 1 : -1) : b[sort.key!] > a[sort.key!] ? 1 : -1,
      );
    } else {
      this.listOfDisplayCycleCountResults = this.listOfAllCycleCountResults;
    }
  }

  /**
   * Cancelled Cycle Count Table event and attribute
   * > Sort
   * > select / select all
   * > reopen select / reopen all
   */

  cancelledCycleCountCurrentPageDataChange($event: CycleCountRequest[]): void {
    this.listOfDisplayCancelledCycleCountRequests = $event;
    this.cancelledCycleCountTableRefreshStatus();
  }

  cancelledCycleCountTableRefreshStatus(): void {
    this.cancelledCycleCountTableAllChecked = this.listOfDisplayCancelledCycleCountRequests.every(
      item => this.cancelledCycleCountTableMapOfCheckedId[item.id],
    );
    this.cancelledCycleCountTableIndeterminate =
      this.listOfDisplayCancelledCycleCountRequests.some(
        item => this.cancelledCycleCountTableMapOfCheckedId[item.id],
      ) && !this.cancelledCycleCountTableAllChecked;
  }

  cancelledCycleCountTableCheckAll(value: boolean): void {
    this.listOfDisplayCancelledCycleCountRequests.forEach(
      item => (this.cancelledCycleCountTableMapOfCheckedId[item.id] = value),
    );
    this.cancelledCycleCountTableRefreshStatus();
  }

  sortCancelledCycleCountRequestTable(sort: { key: string; value: string }): void {
    if (sort.key && sort.value) {
      this.listOfDisplayCancelledCycleCountRequests = this.listOfAllCancelledCycleCountRequests.sort((a, b) =>
        sort.value === 'ascend' ? (a[sort.key!] > b[sort.key!] ? 1 : -1) : b[sort.key!] > a[sort.key!] ? 1 : -1,
      );
    } else {
      this.listOfDisplayCancelledCycleCountRequests = this.listOfAllCancelledCycleCountRequests;
    }
  }

  getSelectedCancelledCycleCounts(): CycleCountRequest[] {
    const selectedCancelledCycleCounts: CycleCountRequest[] = [];
    this.listOfAllCancelledCycleCountRequests.forEach((cycleCountRequest: CycleCountRequest) => {
      if (this.cancelledCycleCountTableMapOfCheckedId[cycleCountRequest.id] === true) {
        selectedCancelledCycleCounts.push(cycleCountRequest);
      }
    });
    return selectedCancelledCycleCounts;
  }
  reopenCancelledCycleCountRequest() {
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
    this.openAuditCountTableRefreshStatus();
  }

  openAuditCountTableRefreshStatus(): void {
    this.openAuditCountTableAllChecked = this.listOfDisplayOpenAuditCountRequests.every(
      item => this.openAuditCountTableMapOfCheckedId[item.id],
    );
    this.openAuditCountTableIndeterminate =
      this.listOfDisplayOpenAuditCountRequests.some(item => this.openAuditCountTableMapOfCheckedId[item.id]) &&
      !this.openAuditCountTableAllChecked;
  }

  openAuditCountTableCheckAll(value: boolean): void {
    this.listOfDisplayOpenAuditCountRequests.forEach(item => (this.openAuditCountTableMapOfCheckedId[item.id] = value));
    this.openAuditCountTableRefreshStatus();
  }

  sortOpenAuditCountRequestTable(sort: { key: string; value: string }): void {
    if (sort.key && sort.value) {
      this.listOfDisplayOpenAuditCountRequests = this.listOfAllOpenAuditCountRequests.sort((a, b) =>
        sort.value === 'ascend' ? (a[sort.key!] > b[sort.key!] ? 1 : -1) : b[sort.key!] > a[sort.key!] ? 1 : -1,
      );
    } else {
      this.listOfDisplayOpenAuditCountRequests = this.listOfAllOpenAuditCountRequests;
    }
  }

  getSelectedOpenAuditCounts(): AuditCountRequest[] {
    const selectedOpenAuditCounts: AuditCountRequest[] = [];
    this.listOfAllOpenAuditCountRequests.forEach((auditCountRequest: AuditCountRequest) => {
      if (this.openAuditCountTableMapOfCheckedId[auditCountRequest.id] === true) {
        selectedOpenAuditCounts.push(auditCountRequest);
      }
    });
    return selectedOpenAuditCounts;
  }

  confirmSelectedAuditCounts() {
    this.auditCountRequestService.confirmAuditCountRequests(this.getSelectedOpenAuditCounts()).subscribe(res => {
      this.refreshCountBatchResults();
    });
  }

  confirmAllAuditCounts() {
    this.auditCountRequestService.confirmAuditCountRequests(this.listOfAllOpenAuditCountRequests).subscribe(res => {
      this.refreshCountBatchResults();
    });
  }

  printSelectedAuditCounts() {
    this.auditCountRequestService.printAuditCountRequestReport(
      this.requestForm.controls.batchId.value,
      this.getSelectedOpenAuditCounts(),
    );
  }

  printAllAuditCounts() {
    this.auditCountRequestService.printAuditCountRequestReport(
      this.requestForm.controls.batchId.value,
      this.listOfAllOpenAuditCountRequests,
    );
  }

  /**
   * Cycle count result event and attribute
   * > Sort
   */
  auditCountResultsCurrentPageDataChange($event: AuditCountResult[]): void {
    this.listOfDisplayAuditCountResults = $event;
  }

  sortAuditCountResultsTable(sort: { key: string; value: string }): void {
    if (sort.key && sort.value) {
      this.listOfDisplayAuditCountResults = this.listOfAllAuditCountResults.sort((a, b) =>
        sort.value === 'ascend' ? (a[sort.key!] > b[sort.key!] ? 1 : -1) : b[sort.key!] > a[sort.key!] ? 1 : -1,
      );
    } else {
      this.listOfDisplayAuditCountResults = this.listOfAllAuditCountResults;
    }
  }
}
