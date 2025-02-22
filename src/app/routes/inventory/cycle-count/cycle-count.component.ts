import { formatDate } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder,  UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';

import { UserService } from '../../auth/services/user.service';
import { ColumnItem } from '../../util/models/column-item';
import { CycleCountBatch } from '../models/cycle-count-batch';
import { CycleCountBatchService } from '../services/cycle-count-batch.service';

@Component({
    selector: 'app-inventory-cycle-count',
    templateUrl: './cycle-count.component.html',
    styleUrls: ['./cycle-count.component.less'],
    standalone: false
})
export class InventoryCycleCountComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  listOfColumns: Array<ColumnItem<CycleCountBatch>> = [
    {
      name: 'cycle-count.batchId',
      showSort: true,
      sortOrder: null,
      sortFn: (a: CycleCountBatch, b: CycleCountBatch) => a.batchId.localeCompare(b.batchId),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'cycle-count-request.count',
      showSort: true,
      sortOrder: null,
      sortFn: (a: CycleCountBatch, b: CycleCountBatch) => a.requestLocationCount - b.requestLocationCount,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'cycle-count-request.open.count',
      showSort: true,
      sortOrder: null,
      sortFn: (a: CycleCountBatch, b: CycleCountBatch) => a.openLocationCount - b.openLocationCount,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'cycle-count-request.finished.count',
      showSort: true,
      sortOrder: null,
      sortFn: (a: CycleCountBatch, b: CycleCountBatch) => a.finishedLocationCount - b.finishedLocationCount,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'cycle-count-request.cancelled.count',
      showSort: true,
      sortOrder: null,
      sortFn: (a: CycleCountBatch, b: CycleCountBatch) => a.cancelledLocationCount - b.cancelledLocationCount,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'audit-count-request.count',
      showSort: true,
      sortOrder: null,
      sortFn: (a: CycleCountBatch, b: CycleCountBatch) => a.openAuditLocationCount - b.openAuditLocationCount,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'audit-count-result.count',
      showSort: true,
      sortOrder: null,
      sortFn: (a: CycleCountBatch, b: CycleCountBatch) => a.finishedAuditLocationCount - b.finishedAuditLocationCount,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];

  // Form related data and functions
  searchForm!: UntypedFormGroup;
  searching = false;
  isSpinning = false;
  searchResult = '';

  // Table data for display
  cycleCountBatches: CycleCountBatch[] = [];
  listOfDisplayCycleCountBatches: CycleCountBatch[] = [];

  isCollapse = false;

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private cycleCountBatchService: CycleCountBatchService, 
    private userService: UserService,
  ) { 
    userService.isCurrentPageDisplayOnly("/inventory/count/cycle-count").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                     
  
  }

  resetForm(): void {
    this.searchForm.reset();
    this.cycleCountBatches = [];
    this.listOfDisplayCycleCountBatches = [];
  }
  search(): void {
    this.isSpinning = true;
    this.searchResult = '';
    this.cycleCountBatchService.getCycleCountBatches(this.searchForm.value.batchId).subscribe(
      cycleCountBatchRes => {
        this.cycleCountBatches = cycleCountBatchRes;
        this.listOfDisplayCycleCountBatches = cycleCountBatchRes;
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: cycleCountBatchRes.length,
        });
      },
      () => {
        this.isSpinning = false;
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: CycleCountBatch[]): void {
    this.listOfDisplayCycleCountBatches = $event;
  }


  ngOnInit(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      batchId: [null],
    });
  }
}
