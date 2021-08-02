import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { InventorySnapshot } from '../models/inventory-snapshot';
import { InventorySnapshotStatus } from '../models/inventory-snapshot-status.enum';
import { InventorySnapshotService } from '../services/inventory-snapshot.service';

@Component({
  selector: 'app-inventory-inventory-snapshot',
  templateUrl: './inventory-snapshot.component.html',
  styleUrls: ['./inventory-snapshot.component.less'],
})
export class InventoryInventorySnapshotComponent implements OnInit {

  listOfColumns: ColumnItem[] = [
    {
      name: 'inventory-snapshot.batch-number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventorySnapshot, b: InventorySnapshot) => this.utilService.compareNullableString(a.batchNumber, b.batchNumber),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'inventory-snapshot.status',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventorySnapshot, b: InventorySnapshot) => this.utilService.compareNullableString(a.status, b.status),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'start-time',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventorySnapshot, b: InventorySnapshot) => this.utilService.compareDateTime(a.startTime, b.startTime),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'complete-time',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventorySnapshot, b: InventorySnapshot) => this.utilService.compareDateTime(a.completeTime, b.completeTime),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },];


  inventorySnapshotStatuses!: InventorySnapshotStatus;
  // Form related data and functions
  searchForm!: FormGroup;
  expandSet = new Set<number>();

  searching = false;
  searchResult = '';


  // Table data for display
  listOfAllInventorySnapshots: InventorySnapshot[] = [];
  listOfDisplayInventorySnapshots: InventorySnapshot[] = [];

  constructor(private http: _HttpClient,
    private fb: FormBuilder,
    private inventorySnapshotService: InventorySnapshotService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private utilService: UtilService,) { }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.inventory.snapshot'));
    this.initSearchForm();
  }

  initSearchForm(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      batchNumber: [null],
      status: [null],
    });


  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllInventorySnapshots = [];
    this.listOfDisplayInventorySnapshots = [];

  }
  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.inventorySnapshotService
      .getInventorySnapshot(
        this.searchForm.value.batchNumber,
        this.searchForm.value.status,
      )
      .subscribe(
        inventorySnapshotRes => {
          this.listOfAllInventorySnapshots = inventorySnapshotRes;
          this.listOfDisplayInventorySnapshots = inventorySnapshotRes;

          this.searching = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: inventorySnapshotRes.length,
          });
        },
        () => {
          this.searching = false;
          this.searchResult = '';
        },
      );
  }

  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }

  showInventorySnapshotDetails(inventorySnapshot: InventorySnapshot) {
    console.log(`inventory snapshot details: ${JSON.stringify(inventorySnapshot.inventorySnapshotDetails)}`);
  }


}
