import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { CycleCountBatch } from '../models/cycle-count-batch';
import { CycleCountBatchService } from '../services/cycle-count-batch.service';

interface ItemData {
  id: number;
  name: string;
  age: number;
  address: string;
}

@Component({
  selector: 'app-inventory-cycle-count',
  templateUrl: './cycle-count.component.html',
  styleUrls: ['./cycle-count.component.less'],
})
export class InventoryCycleCountComponent implements OnInit {
  // Form related data and functions
  searchForm: FormGroup;
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

  constructor(private fb: FormBuilder, private cycleCountBatchService: CycleCountBatchService) {}

  resetForm(): void {
    this.searchForm.reset();
    this.cycleCountBatches = [];
    this.listOfDisplayCycleCountBatches = [];
  }
  search(): void {
    this.cycleCountBatchService.getCycleCountBatches(this.searchForm.value.batchId).subscribe(cycleCountBatchRes => {
      this.cycleCountBatches = cycleCountBatchRes;
      this.listOfDisplayCycleCountBatches = cycleCountBatchRes;
      console.log('cycleCountBatchRes res:\n' + JSON.stringify(cycleCountBatchRes));
    });
  }

  currentPageDataChange($event: CycleCountBatch[]): void {
    this.listOfDisplayCycleCountBatches = $event;
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    this.listOfDisplayCycleCountBatches = this.cycleCountBatches.sort((a, b) =>
      this.sortValue === 'ascend'
        ? a[this.sortKey!] > b[this.sortKey!]
          ? 1
          : -1
        : b[this.sortKey!] > a[this.sortKey!]
        ? 1
        : -1,
    );
  }

  ngOnInit() {
    // initiate the search form
    this.searchForm = this.fb.group({
      batchId: [null],
    });
  }
}
