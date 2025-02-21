import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { saveAs } from 'file-saver';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { InventorySnapshot } from '../models/inventory-snapshot';
import { InventorySnapshotStatus } from '../models/inventory-snapshot-status.enum';
import { InventorySnapshotService } from '../services/inventory-snapshot.service';


@Component({
    selector: 'app-inventory-inventory-snapshot',
    templateUrl: './inventory-snapshot.component.html',
    styleUrls: ['./inventory-snapshot.component.less'],
    standalone: false
})
export class InventoryInventorySnapshotComponent implements OnInit {

  listOfColumns: Array<ColumnItem<InventorySnapshot>> = [
    {
      name: 'inventory-snapshot.batch-number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventorySnapshot, b: InventorySnapshot) => this.utilService.compareNullableString(a.batchNumber, b.batchNumber),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width:"200px"
    }, {
      name: 'inventory-snapshot.status',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventorySnapshot, b: InventorySnapshot) => this.utilService.compareNullableString(a.status, b.status),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width:"150px"
    }, {
      name: 'start-time',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventorySnapshot, b: InventorySnapshot) => this.utilService.compareDateTime(a.startTime, b.startTime),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width:"200px"
    }, {
      name: 'complete-time',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventorySnapshot, b: InventorySnapshot) => this.utilService.compareDateTime(a.completeTime, b.completeTime),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width:"200px"
    },];


  inventorySnapshotStatuses!: InventorySnapshotStatus;
  // Form related data and functions
  searchForm!: UntypedFormGroup;
  expandSet = new Set<number>();

  searching = false;
  searchResult = '';
  isSpinging = false;


  // Table data for display
  listOfAllInventorySnapshots: InventorySnapshot[] = [];
  listOfDisplayInventorySnapshots: InventorySnapshot[] = [];

  displayOnly = false;
  constructor(private http: _HttpClient,
    private fb: UntypedFormBuilder,
    private inventorySnapshotService: InventorySnapshotService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private messageService: NzMessageService,
    private utilService: UtilService,
    private userService: UserService,) { 
      userService.isCurrentPageDisplayOnly("/inventory/snapshot").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                               
    }

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

  downloadInventorySnapshot(inventorySnapshot: InventorySnapshot) {
    this.isSpinging = true;
    

    this.inventorySnapshotService.downloadInventorySnapshotFile(inventorySnapshot.batchNumber).subscribe(
      {
        next:  (file) => {
          saveAs(file, inventorySnapshot.fileName);
          this.isSpinging = false;

        }, 
        error: () => this.isSpinging = false
      }
    )
  }


  generateInventorySnapshot(inventorySnapshot: InventorySnapshot) {
    this.isSpinging = true;
    this.inventorySnapshotService.generateInventorySnapshotFile(inventorySnapshot.batchNumber).subscribe(
      {
        next:  (fileName) => {
          this.isSpinging = false;
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          console.log(`filename: ${fileName}`);
          inventorySnapshot.fileName = fileName;

        }, 
        error: () => this.isSpinging = false
      }
    )
  }

  removeInventorySnapshotFile(inventorySnapshot: InventorySnapshot) {
    
    this.isSpinging = true;
    this.inventorySnapshotService.removeInventorySnapshotFile(inventorySnapshot.batchNumber).subscribe(
      {
        next:  () => {
          this.isSpinging = false;
          this.messageService.success(this.i18n.fanyi('message.action.success')); 
          inventorySnapshot.fileName = "";

        }, 
        error: () => this.isSpinging = false
      }
    )
  }
}
