import { Component, OnInit, TemplateRef } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { CycleCountRequestType } from '../models/cycle-count-request-type.enum';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CycleCountBatchService } from '../services/cycle-count-batch.service';
import { CycleCountRequest } from '../models/cycle-count-request';
import { CycleCountResult } from '../models/cycle-count-result';
import { AuditCountRequest } from '../models/audit-count-request';
import { AuditCountResult } from '../models/audit-count-result';
import { CycleCountRequestService } from '../services/cycle-count-request.service';
import { CycleCountResultService } from '../services/cycle-count-result.service';
import { AuditCountRequestService } from '../services/audit-count-request.service';
import { AuditCountResultService } from '../services/audit-count-result.service';
import { Lodop, LodopService } from '@delon/abc';
import { PrintingService } from '../../common/services/printing.service';
import { InventoryService } from '../services/inventory.service';
import { Inventory } from '../models/inventory';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';

@Component({
  selector: 'app-inventory-cycle-count-maintenance',
  templateUrl: './cycle-count-maintenance.component.html',
})
export class InventoryCycleCountMaintenanceComponent implements OnInit {
  requestForm: FormGroup;
  pageTitle: string;

  requestType: CycleCountRequestType;

  availableRequestType = CycleCountRequestType;

  listOfOpenCycleCountRequests: CycleCountRequest[] = [];
  openCycleCountRequests: CycleCountRequest[] = [];
  listOfCycleCountResults: CycleCountResult[] = [];
  cycleCountResults: CycleCountResult[] = [];
  listOfCancelledCycleCountRequests: CycleCountRequest[] = [];
  cancelledCycleCountRequests: CycleCountRequest[] = [];
  listOfOpenAuditCountRequests: AuditCountRequest[] = [];
  openAuditCountRequests: AuditCountRequest[] = [];
  listOfAuditCountResults: AuditCountResult[] = [];
  auditCountResults: AuditCountResult[] = [];

  // control for table of open cycle count request
  // checkbox - select all
  openCycleCountTableAllChecked = false;
  openCycleCountTableIndeterminate = false;
  // list of checked checkbox
  openCycleCountTableMapOfCheckedId: { [key: string]: boolean } = {};

  // Model to let the user input cycle count result
  inventoriesToBeCount: Inventory[] = [];
  cycleCountRequestResult: { [inventoryId: number]: number } = {};

  cycleCountRequestConfirmModal: NzModalRef;

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private i18n: I18NService,
    private titleService: TitleService,
    private fb: FormBuilder,
    private cycleCountBatchService: CycleCountBatchService,
    private cycleCountRequestService: CycleCountRequestService,
    private cycleCountResulttService: CycleCountResultService,
    private auditCountRequestService: AuditCountRequestService,
    private auditCountResultService: AuditCountResultService,
    private modalService: NzModalService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.inventory.cycle-count-request.title');
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('page.inventory.cycle-count-request.title'));

    this.requestForm = this.fb.group({
      batchId: [null],
      autoGenerateId: [null],
      requestType: [null],
      startValue: [null],
      endValue: [null],
      includeEmptyLocation: [null],
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.batchId) {
        this.requestForm.controls.batchId.setValue(params.batchId);
        this.requestForm.controls.batchId.disable();
        this.requestForm.controls.autoGenerateId.disable();
      }
      this.refreshCountBatchResults();
    });
  }

  generateBatchId() {
    if (this.requestForm.controls.autoGenerateId.value) {
      this.requestForm.controls.batchId.disable();
      if (!this.requestForm.controls.batchId.value) {
        this.cycleCountBatchService.getNextCycleCountBatchId().subscribe(nextId => {
          console.log(JSON.stringify(nextId));
          this.requestForm.controls.batchId.setValue(nextId);
        });
      }
    } else {
      this.requestForm.controls.batchId.enable();
    }
  }
  requestByLocation(): boolean {
    return this.requestType === CycleCountRequestType.Location;
  }
  requestByItem(): boolean {
    return this.requestType === CycleCountRequestType.Item;
  }
  requestByAisle(): boolean {
    return this.requestType === CycleCountRequestType.Aisle;
  }
  requestTypeChange(newRequestType) {
    this.requestType = newRequestType;
  }

  generateCountRequest() {}

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
      this.openCycleCountRequests = res;
      this.listOfOpenCycleCountRequests = res;
    });
  }
  loadFinishedCycleCountRequest(batchId: string) {
    this.cycleCountResulttService.getCycleCountResultDetails(batchId, true).subscribe(res => {
      this.cycleCountResults = res;
      this.listOfCycleCountResults = res;
    });
  }
  loadCancelledCycleCountRequest(batchId: string) {
    this.cycleCountRequestService.getCancelledCycleCountRequestDetails(batchId, true).subscribe(res => {
      this.cancelledCycleCountRequests = res;
      this.listOfCancelledCycleCountRequests = res;
    });
  }
  loadOpenAuditCountRequest(batchId: string) {
    this.auditCountRequestService.getAuditCountRequestDetails(batchId, true).subscribe(res => {
      this.openAuditCountRequests = res;
      this.listOfOpenAuditCountRequests = res;
    });
  }
  loadAuditCountResult(batchId: string) {
    console.log('start to load audit count result');
    this.auditCountResultService.getAuditCountResultDetails(batchId, true).subscribe(res => {
      this.auditCountResults = res;
      this.listOfAuditCountResults = res;
      console.log('listOfAuditCountResults:\n' + JSON.stringify(this.listOfAuditCountResults));
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
    this.listOfOpenCycleCountRequests = $event;
    this.openCycleCountTableRefreshStatus();
  }

  openCycleCountTableRefreshStatus(): void {
    this.openCycleCountTableAllChecked = this.listOfOpenCycleCountRequests.every(
      item => this.openCycleCountTableMapOfCheckedId[item.id],
    );
    this.openCycleCountTableIndeterminate =
      this.listOfOpenCycleCountRequests.some(item => this.openCycleCountTableMapOfCheckedId[item.id]) &&
      !this.openCycleCountTableAllChecked;
  }

  openCycleCountTableCheckAll(value: boolean): void {
    this.listOfOpenCycleCountRequests.forEach(item => (this.openCycleCountTableMapOfCheckedId[item.id] = value));
    this.openCycleCountTableRefreshStatus();
  }

  sortOpenCycleCountRequestTable(sort: { key: string; value: string }): void {
    if (sort.key && sort.value) {
      this.listOfOpenCycleCountRequests = this.openCycleCountRequests.sort((a, b) =>
        sort.value === 'ascend' ? (a[sort.key!] > b[sort.key!] ? 1 : -1) : b[sort.key!] > a[sort.key!] ? 1 : -1,
      );
    } else {
      this.listOfOpenCycleCountRequests = this.openCycleCountRequests;
    }
  }

  getSelectedOpenCycleCounts(): CycleCountRequest[] {
    const selectedOpenCycleCounts: CycleCountRequest[] = [];
    this.openCycleCountRequests.forEach((cycleCountRequest: CycleCountRequest) => {
      if (this.openCycleCountTableMapOfCheckedId[cycleCountRequest.id] === true) {
        selectedOpenCycleCounts.push(cycleCountRequest);
      }
    });
    return selectedOpenCycleCounts;
  }

  confirmSelectedCycleCounts() {
    this.cycleCountRequestService.confirmCycleCountRequests(this.getSelectedOpenCycleCounts()).subscribe(res => {
      console.log('confirmed!');
      this.refreshCountBatchResults();
    });
  }

  confirmAllCycleCounts() {
    this.cycleCountRequestService.confirmCycleCountRequests(this.openCycleCountRequests).subscribe(res => {
      console.log('confirmed!');
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
    this.cycleCountRequestService.printCycleCountRequestReport(
      this.requestForm.controls.batchId.value,
      this.openCycleCountRequests,
    );
  }

  cancelSelectedCycleCounts() {
    this.cycleCountRequestService.cancelCycleCountRequests(this.getSelectedOpenCycleCounts()).subscribe(res => {
      console.log('cancelled!');
      this.refreshCountBatchResults();
    });
  }
  openCountResultModal(
    cycleCountRequest: CycleCountRequest,
    tplCycleCountRequestConfirmModalTitle: TemplateRef<{}>,
    tplCycleCountRequestConfirmModalContent: TemplateRef<{}>,
  ) {
    // Get all inventory, allow the user to input quantity
    this.cycleCountRequestService.getInventoryForCount(cycleCountRequest).subscribe(inventories => {
      this.inventoriesToBeCount = inventories;
      this.cycleCountRequestResult = {};
      this.inventoriesToBeCount.forEach(inventory => (this.cycleCountRequestResult[inventory.id] = 0));

      // show the model
      this.cycleCountRequestConfirmModal = this.modalService.create({
        nzTitle: tplCycleCountRequestConfirmModalTitle,
        nzContent: tplCycleCountRequestConfirmModalContent,
        nzOkText: this.i18n.fanyi('description.field.button.confirm'),
        nzCancelText: this.i18n.fanyi('description.field.button.cancel'),
        nzMaskClosable: false,
        nzOnCancel: () => {
          this.cycleCountRequestConfirmModal.destroy();
          this.refreshCountBatchResults();
        },
        nzOnOk: () => {
          this.saveCycleCountResults(cycleCountRequest, this.cycleCountRequestResult);
          this.refreshCountBatchResults();
        },
        nzWidth: 700,
      });
    });
  }
  saveCycleCountResults(
    cycleCountRequest: CycleCountRequest,
    cycleCountRequestResult: { [inventoryId: number]: number },
  ) {
    console.log('cycleCountRequestResult:' + JSON.stringify(cycleCountRequestResult));
    this.cycleCountRequestService
      .saveCycleCountResults(cycleCountRequest, cycleCountRequestResult)
      .subscribe(res => console.log('result saved!'));
  }

  /**
   * Cycle count result event and attribute
   * > Sort
   */
  cycleCountResultPageDataChange($event: CycleCountResult[]): void {
    this.listOfCycleCountResults = $event;
  }

  sortCycleCountResultTable(sort: { key: string; value: string }): void {
    if (sort.key && sort.value) {
      this.listOfCycleCountResults = this.cycleCountResults.sort((a, b) =>
        sort.value === 'ascend' ? (a[sort.key!] > b[sort.key!] ? 1 : -1) : b[sort.key!] > a[sort.key!] ? 1 : -1,
      );
    } else {
      this.listOfCycleCountResults = this.cycleCountResults;
    }
  }

  /**
   * Cancelled Cycle Count Table event and attribute
   * > Sort
   * > select / select all
   * > reopen select / reopen all
   */

  cancelledCycleCountCurrentPageDataChange($event: CycleCountRequest[]): void {
    this.listOfCancelledCycleCountRequests = $event;
    this.cancelledCycleCountTableRefreshStatus();
  }

  cancelledCycleCountTableRefreshStatus(): void {
    this.cancelledCycleCountTableAllChecked = this.listOfCancelledCycleCountRequests.every(
      item => this.cancelledCycleCountTableMapOfCheckedId[item.id],
    );
    this.cancelledCycleCountTableIndeterminate =
      this.listOfCancelledCycleCountRequests.some(item => this.cancelledCycleCountTableMapOfCheckedId[item.id]) &&
      !this.cancelledCycleCountTableAllChecked;
  }

  cancelledCycleCountTableCheckAll(value: boolean): void {
    this.listOfCancelledCycleCountRequests.forEach(
      item => (this.cancelledCycleCountTableMapOfCheckedId[item.id] = value),
    );
    this.cancelledCycleCountTableRefreshStatus();
  }

  sortCancelledCycleCountRequestTable(sort: { key: string; value: string }): void {
    if (sort.key && sort.value) {
      this.listOfCancelledCycleCountRequests = this.cancelledCycleCountRequests.sort((a, b) =>
        sort.value === 'ascend' ? (a[sort.key!] > b[sort.key!] ? 1 : -1) : b[sort.key!] > a[sort.key!] ? 1 : -1,
      );
    } else {
      this.listOfCancelledCycleCountRequests = this.cancelledCycleCountRequests;
    }
  }

  getSelectedCancelledCycleCounts(): CycleCountRequest[] {
    const selectedCancelledCycleCounts: CycleCountRequest[] = [];
    this.cancelledCycleCountRequests.forEach((cycleCountRequest: CycleCountRequest) => {
      if (this.cancelledCycleCountTableMapOfCheckedId[cycleCountRequest.id] === true) {
        selectedCancelledCycleCounts.push(cycleCountRequest);
      }
    });
    return selectedCancelledCycleCounts;
  }
  reopenCancelledCycleCountRequest() {
    this.cycleCountRequestService
      .reopenCancelledCycleCountRequests(this.getSelectedCancelledCycleCounts())
      .subscribe(res => console.log('selected cycle count requests are reopened'));
  }

  /**
   * Open Audit Count Table event and attribute
   * > Sort
   * > select / select all
   * > confirm / confirm all
   * > print report / print report for all
   */

  openAuditCountCurrentPageDataChange($event: AuditCountRequest[]): void {
    this.listOfOpenAuditCountRequests = $event;
    this.openAuditCountTableRefreshStatus();
  }

  openAuditCountTableRefreshStatus(): void {
    this.openAuditCountTableAllChecked = this.listOfOpenAuditCountRequests.every(
      item => this.openAuditCountTableMapOfCheckedId[item.id],
    );
    this.openAuditCountTableIndeterminate =
      this.listOfOpenAuditCountRequests.some(item => this.openAuditCountTableMapOfCheckedId[item.id]) &&
      !this.openAuditCountTableAllChecked;
  }

  openAuditCountTableCheckAll(value: boolean): void {
    this.listOfOpenAuditCountRequests.forEach(item => (this.openAuditCountTableMapOfCheckedId[item.id] = value));
    this.openAuditCountTableRefreshStatus();
  }

  sortOpenAuditCountRequestTable(sort: { key: string; value: string }): void {
    if (sort.key && sort.value) {
      this.listOfOpenAuditCountRequests = this.openAuditCountRequests.sort((a, b) =>
        sort.value === 'ascend' ? (a[sort.key!] > b[sort.key!] ? 1 : -1) : b[sort.key!] > a[sort.key!] ? 1 : -1,
      );
    } else {
      this.listOfOpenAuditCountRequests = this.openAuditCountRequests;
    }
  }

  getSelectedOpenAuditCounts(): AuditCountRequest[] {
    const selectedOpenAuditCounts: AuditCountRequest[] = [];
    this.openAuditCountRequests.forEach((auditCountRequest: AuditCountRequest) => {
      if (this.openAuditCountTableMapOfCheckedId[auditCountRequest.id] === true) {
        selectedOpenAuditCounts.push(auditCountRequest);
      }
    });
    return selectedOpenAuditCounts;
  }

  confirmSelectedAuditCounts() {
    this.auditCountRequestService.confirmAuditCountRequests(this.getSelectedOpenAuditCounts()).subscribe(res => {
      console.log('audit count confirmed!');
      this.refreshCountBatchResults();
    });
  }

  confirmAllAuditCounts() {
    this.auditCountRequestService.confirmAuditCountRequests(this.openAuditCountRequests).subscribe(res => {
      console.log('audit count confirmed!');
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
      this.openAuditCountRequests,
    );
  }

  /**
   * Cycle count result event and attribute
   * > Sort
   */
  auditCountResultsCurrentPageDataChange($event: AuditCountResult[]): void {
    this.listOfAuditCountResults = $event;
  }

  sortAuditCountResultsTable(sort: { key: string; value: string }): void {
    if (sort.key && sort.value) {
      this.listOfAuditCountResults = this.auditCountResults.sort((a, b) =>
        sort.value === 'ascend' ? (a[sort.key!] > b[sort.key!] ? 1 : -1) : b[sort.key!] > a[sort.key!] ? 1 : -1,
      );
    } else {
      this.listOfAuditCountResults = this.auditCountResults;
    }
  }
}
