import { formatDate } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { Inventory } from '../models/inventory';
import { InventoryAdjustmentRequest } from '../models/inventory-adjustment-request';
import { InventoryAdjustmentRequestStatus } from '../models/inventory-adjustment-request-status.enum';
import { InventoryQuantityChangeType } from '../models/inventory-quantity-change-type.enum';
import { InventoryStatus } from '../models/inventory-status';
import { Item } from '../models/item';
import { ItemPackageType } from '../models/item-package-type';
import { InventoryAdjustmentRequestService } from '../services/inventory-adjustment-request.service';

@Component({
  selector: 'app-inventory-inventory-adjustment-request',
  templateUrl: './inventory-adjustment-request.component.html',
  styleUrls: ['./inventory-adjustment-request.component.less'],
})
export class InventoryInventoryAdjustmentRequestComponent implements OnInit {
  listOfColumns: ColumnItem[] = [    
    {
          name: 'inventory-adjustment-request.inventory-id',
          showSort: true,
          sortOrder: null,
          sortFn: (a: InventoryAdjustmentRequest, b: InventoryAdjustmentRequest) => this.utilService.compareNullableNumber(a.inventoryId, b.inventoryId),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'lpn',
          showSort: true,
          sortOrder: null,
          sortFn: (a: InventoryAdjustmentRequest, b: InventoryAdjustmentRequest) => this.utilService.compareNullableString(a.lpn, b.lpn),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'item',
          showSort: true,
          sortOrder: null,
          sortFn: (a: InventoryAdjustmentRequest, b: InventoryAdjustmentRequest) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'item.package-type',
          showSort: true,
          sortOrder: null,
          sortFn: (a: InventoryAdjustmentRequest, b: InventoryAdjustmentRequest) => this.utilService.compareNullableObjField(a.itemPackageType, b.itemPackageType, 'name'),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'location',
          showSort: true,
          sortOrder: null,
          sortFn: (a: InventoryAdjustmentRequest, b: InventoryAdjustmentRequest) => this.utilService.compareNullableObjField(a.location, b.location, 'name'),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'quantity',
          showSort: true,
          sortOrder: null,
          sortFn: (a: InventoryAdjustmentRequest, b: InventoryAdjustmentRequest) => this.utilService.compareNullableNumber(a.quantity, b.quantity),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'inventory-adjustment-request.new-quantity',
          showSort: true,
          sortOrder: null,
          sortFn: (a: InventoryAdjustmentRequest, b: InventoryAdjustmentRequest) => this.utilService.compareNullableNumber(a.newQuantity, b.newQuantity),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'inventory.status',
          showSort: true,
          sortOrder: null,
          sortFn: (a: InventoryAdjustmentRequest, b: InventoryAdjustmentRequest) => this.utilService.compareNullableObjField(a.inventoryStatus, b.inventoryStatus, 'name'),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'inventory-quantity-change-type',
          showSort: true,
          sortOrder: null,
          sortFn: (a: InventoryAdjustmentRequest, b: InventoryAdjustmentRequest) => this.utilService.compareNullableString(a.inventoryQuantityChangeType.toString(), b.inventoryQuantityChangeType.toString()),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'inventory-adjustment-request.status',
          showSort: true,
          sortOrder: null,
          sortFn: (a: InventoryAdjustmentRequest, b: InventoryAdjustmentRequest) => this.utilService.compareNullableString(a.status.toString(), b.status.toString()),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'inventory-adjustment-request.requested-by-username',
          showSort: true,
          sortOrder: null,
          sortFn: (a: InventoryAdjustmentRequest, b: InventoryAdjustmentRequest) => this.utilService.compareNullableString(a.requestedByUsername, b.requestedByUsername),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'inventory-adjustment-request.requested-by-datetime',
          showSort: true,
          sortOrder: null,
          sortFn: (a: InventoryAdjustmentRequest, b: InventoryAdjustmentRequest) => this.utilService.compareDateTime(a.requestedByDateTime, b.requestedByDateTime),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'inventory-adjustment-request.processed-by-username',
          showSort: true,
          sortOrder: null,
          sortFn: (a: InventoryAdjustmentRequest, b: InventoryAdjustmentRequest) => this.utilService.compareNullableString(a.processedByUsername, b.processedByUsername),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'inventory-adjustment-request.processed-by-datetime',
          showSort: true,
          sortOrder: null,
          sortFn: (a: InventoryAdjustmentRequest, b: InventoryAdjustmentRequest) => this.utilService.compareDateTime(a.processedByDateTime, b.processedByDateTime),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'inventory-adjustment-request.document-number',
          showSort: true,
          sortOrder: null,
          sortFn: (a: InventoryAdjustmentRequest, b: InventoryAdjustmentRequest) => this.utilService.compareNullableString(a.documentNumber, b.documentNumber),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'inventory-adjustment-request.comment',
          showSort: true,
          sortOrder: null,
          sortFn: (a: InventoryAdjustmentRequest, b: InventoryAdjustmentRequest) => this.utilService.compareNullableString(a.comment, b.comment),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }
        
        ];
        
  // Select control for clients and item families
  inventoryQuantityChangeTypes = InventoryQuantityChangeType;
  inventoryAdjustmentRequestStatuses = InventoryAdjustmentRequestStatus;
  // Form related data and functions
  searchForm!: FormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllInventoryAdjustmentRequests: InventoryAdjustmentRequest[] = [];
  listOfDisplayInventoryAdjustmentRequests: InventoryAdjustmentRequest[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;
  // Filters meta data
  filtersByLpn = [];
  filtersByItem = [];
  filtersByItemPackageType = [];
  filtersByLocation = [];
  filtersByInventoryStatus = [];
  // Save filters that already selected
  selectedFiltersByLpn: string[] = [];
  selectedFiltersByItem: string[] = [];
  selectedFiltersByItemPackageType: string[] = [];
  selectedFiltersByLocation: string[] = [];
  selectedFiltersByInventoryStatus: string[] = [];

  inventoryAdjustmentRequestProcessForm!: FormGroup;

  inventoryAdjustmentRequestModal!: NzModalRef;

  isCollapse = false;

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: FormBuilder,
    private inventoryAdjustmentRequestService: InventoryAdjustmentRequestService,
    private i18n: I18NService,
    private titleService: TitleService,
    private messageService: NzMessageService,
    private modalService: NzModalService,
    private activatedRoute: ActivatedRoute,
    private utilService: UtilService,
  ) {}
  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.inventory.inventory-adjustment-request'));
    this.initSearchForm();

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.inventoryId) {
        this.search(params.inventoryId);
      } else if (params.locationName) {
        this.searchForm.controls.location.setValue(params.locationName);
        this.search();
      }
    });
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllInventoryAdjustmentRequests = [];
    this.listOfDisplayInventoryAdjustmentRequests = [];

    this.filtersByLpn = [];
    this.filtersByItem = [];
    this.filtersByItemPackageType = [];
    this.filtersByLocation = [];
    this.filtersByInventoryStatus = [];
  }
  search(inventoryId?: number): void {
    this.searching = true;
    this.searchResult = '';
    this.inventoryAdjustmentRequestService
      .getInventoryAdjustmentRequests(
        this.searchForm.value.status,
        this.searchForm.value.itemName,
        this.searchForm.value.location,
        this.searchForm.value.inventoryQuantityChangeType,
        inventoryId,
      )
      .subscribe(
        inventoryAdjustmentRequestRes => {
          this.processInventoryAdjustmentRequestQueryResult(inventoryAdjustmentRequestRes);
          this.searching = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: inventoryAdjustmentRequestRes.length,
          });
        },
        () => {
          this.searching = false;
          this.searchResult = '';
        },
      );
  }

  processInventoryAdjustmentRequestQueryResult(inventoryAdjustmentRequestRes: InventoryAdjustmentRequest[]): void {
    this.listOfAllInventoryAdjustmentRequests = inventoryAdjustmentRequestRes;
    this.listOfDisplayInventoryAdjustmentRequests = inventoryAdjustmentRequestRes;

    this.filtersByLpn = [];
    this.filtersByItem = [];
    this.filtersByItemPackageType = [];
    this.filtersByLocation = [];
    this.filtersByInventoryStatus = [];

    const existingLpn = new Set();
    const existingItemId = new Set();
    const existingItemPackageTypeId = new Set();
    const existingLocation = new Set();
    const existingInventoryStatusId = new Set();

    
  }

  currentPageDataChange($event: InventoryAdjustmentRequest[]): void {
    this.listOfDisplayInventoryAdjustmentRequests = $event;
  }
  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    this.sortAndFilter();
  }

  filter(
    selectedFiltersByLpn: string[],
    selectedFiltersByItem: string[],
    selectedFiltersByItemPackageType: string[],
    selectedFiltersByLocation: string[],
    selectedFiltersByInventoryStatus: string[],
  ): void {
    this.selectedFiltersByLpn = selectedFiltersByLpn;
    this.selectedFiltersByItem = selectedFiltersByItem;
    this.selectedFiltersByItemPackageType = selectedFiltersByItemPackageType;
    this.selectedFiltersByLocation = selectedFiltersByLocation;
    this.selectedFiltersByInventoryStatus = selectedFiltersByInventoryStatus;
    this.sortAndFilter();
  }

  sortAndFilter(): void {
    // filter data
    const filterFunc = (inventoryActivity: {
      id: number;
      lpn: string;
      location: WarehouseLocation;
      item: Item;
      itemPackageType: ItemPackageType;
      inventoryStatus: InventoryStatus;
    }) =>
      (this.selectedFiltersByLpn.length
        ? this.selectedFiltersByLpn.some(lpn => inventoryActivity.lpn.indexOf(lpn) !== -1)
        : true) &&
      (this.selectedFiltersByItem.length
        ? this.selectedFiltersByItem.some(id => inventoryActivity.item !== null && inventoryActivity.item.id === +id)
        : true) &&
      (this.selectedFiltersByItemPackageType.length
        ? this.selectedFiltersByItemPackageType.some(
            id => inventoryActivity.itemPackageType !== null && inventoryActivity.itemPackageType.id === +id,
          )
        : true) &&
      (this.selectedFiltersByLocation.length
        ? this.selectedFiltersByLocation.some(location => inventoryActivity.location.name.indexOf(location) !== -1)
        : true) &&
      (this.selectedFiltersByInventoryStatus.length
        ? this.selectedFiltersByInventoryStatus.some(
            id => inventoryActivity.inventoryStatus !== null && inventoryActivity.inventoryStatus.id === +id,
          )
        : true);
    const data = this.listOfAllInventoryAdjustmentRequests.filter(inventoryActivity => filterFunc(inventoryActivity));

    
  }

  initSearchForm(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      inventoryQuantityChangeType: [null],
      status: [null],
      itemName: [null],
      location: [null],
    });
  }

  openRequestProcessModel(
    inventoryAdjustmentRequest: InventoryAdjustmentRequest,
    tplRequestProcessModalTitle: TemplateRef<{}>,
    tplRequestProcessModalContent: TemplateRef<{}>,
  ): void {
    this.inventoryAdjustmentRequestProcessForm = this.fb.group({
      lpn: new FormControl({ value: inventoryAdjustmentRequest.lpn, disabled: true }),
      itemNumber: new FormControl({ value: inventoryAdjustmentRequest.item.name, disabled: true }),
      itemDescription: new FormControl({ value: inventoryAdjustmentRequest.item.description, disabled: true }),
      inventoryStatus: new FormControl({ value: inventoryAdjustmentRequest.inventoryStatus.name, disabled: true }),
      itemPackageType: new FormControl({ value: inventoryAdjustmentRequest.itemPackageType.name, disabled: true }),
      quantity: new FormControl({ value: inventoryAdjustmentRequest.quantity, disabled: true }),
      newQuantity: new FormControl({ value: inventoryAdjustmentRequest.newQuantity, disabled: true }),
      locationName: new FormControl({ value: inventoryAdjustmentRequest.location.name, disabled: true }),
      documentNumber: new FormControl({ value: inventoryAdjustmentRequest.documentNumber, disabled: true }),
      approved: new FormControl({ value: true, disabled: false }),
      comment: new FormControl({ value: inventoryAdjustmentRequest.comment, disabled: true }),
    });

    this.inventoryAdjustmentRequestModal = this.modalService.create({
      nzTitle: tplRequestProcessModalTitle,
      nzContent: tplRequestProcessModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.inventoryAdjustmentRequestModal.destroy();
        // this.refreshReceiptResults();
      },
      nzOnOk: () => {
        this.processInventoryAdjustmentRequest(
          inventoryAdjustmentRequest,
          this.inventoryAdjustmentRequestProcessForm.controls.approved.value,
          this.inventoryAdjustmentRequestProcessForm.controls.comment.value,
        );
      },
      nzWidth: 1000,
    });
  }
  processInventoryAdjustmentRequest(
    inventoryAdjustmentRequest: InventoryAdjustmentRequest,
    approved: boolean,
    comment: string,
  ): void {
    console.log(`approved: ${approved}, comment: ${comment}`);
    this.inventoryAdjustmentRequestService
      .processInventoryAdjustmentRequest(inventoryAdjustmentRequest, approved, comment)
      .subscribe(inventoryAdjustmentRequestRes => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.refresh();
      });
  }
  refresh(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.inventoryId) {
        this.search(params.inventoryId);
      } else if (params.locationName) {
        this.searchForm.controls.location.setValue(params.locationName);
        this.search();
      } else {
        this.search();
      }
    });
  }
}
