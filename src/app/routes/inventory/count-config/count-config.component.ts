import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormControl, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { Client } from '../../common/models/client';
import { CycleCountBatch } from '../models/cycle-count-batch';
import { Item } from '../models/item';
import { ItemFamily } from '../models/item-family';
import { CycleCountBatchService } from '../services/cycle-count-batch.service';
 
@Component({
    selector: 'app-inventory-count-config',
    templateUrl: './count-config.component.html',
    styleUrls: ['./count-config.component.less'],
    standalone: false
})
export class InventoryCountConfigComponent implements OnInit {
  // Form related data and functions
  searchForm!: UntypedFormGroup;
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

  constructor(private fb: UntypedFormBuilder, private cycleCountBatchService: CycleCountBatchService) {}

  resetForm(): void {
    this.searchForm.reset();
    this.cycleCountBatches = [];
    this.listOfDisplayCycleCountBatches = [];
  }
  search(): void {
    this.cycleCountBatchService.getCycleCountBatches(this.searchForm.value.batchId).subscribe(cycleCountBatchRes => {
      this.cycleCountBatches = cycleCountBatchRes;
      this.listOfDisplayCycleCountBatches = cycleCountBatchRes;
    });
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
