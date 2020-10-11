import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { I18NService } from '@core/i18n/i18n.service';
import { _HttpClient } from '@delon/theme';
import { CycleCountBatch } from '../models/cycle-count-batch';
import { CycleCountBatchService } from '../services/cycle-count-batch.service';

@Component({
  selector: 'app-inventory-cycle-count',
  templateUrl: './cycle-count.component.html',
  styleUrls: ['./cycle-count.component.less'],
})
export class InventoryCycleCountComponent implements OnInit {
  // Form related data and functions
  searchForm!: FormGroup;
  searching = false;
  searchResult = '';

  // Table data for display
  cycleCountBatches: CycleCountBatch[] = [];
  listOfDisplayCycleCountBatches: CycleCountBatch[] = [];

  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  isCollapse = false;

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: FormBuilder,
    private cycleCountBatchService: CycleCountBatchService,
    private i18n: I18NService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.cycleCountBatches = [];
    this.listOfDisplayCycleCountBatches = [];
  }
  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.cycleCountBatchService.getCycleCountBatches(this.searchForm.value.batchId).subscribe(
      cycleCountBatchRes => {
        this.cycleCountBatches = cycleCountBatchRes;
        this.listOfDisplayCycleCountBatches = cycleCountBatchRes;
        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: cycleCountBatchRes.length,
        });
      },
      () => {
        this.searching = false;
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: CycleCountBatch[]): void {
    this.listOfDisplayCycleCountBatches = $event;
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value; 
  }

  ngOnInit(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      batchId: [null],
    });
  }
}
