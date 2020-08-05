import { Component, OnInit, TemplateRef } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { InventoryQuantityChangeType } from '../models/inventory-quantity-change-type.enum';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { InventoryAdjustmentRequest } from '../models/inventory-adjustment-request';
import { InventoryAdjustmentRequestService } from '../services/inventory-adjustment-request.service';
import { I18NService } from '@core';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { Item } from '../models/item';
import { ItemPackageType } from '../models/item-package-type';
import { InventoryStatus } from '../models/inventory-status';
import { InventoryAdjustmentRequestStatus } from '../models/inventory-adjustment-request-status.enum';
import { Inventory } from '../models/inventory';
import { NzModalRef, NzModalService, NzMessageService } from 'ng-zorro-antd';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-inventory-inventory-adjustment-request',
  templateUrl: './inventory-adjustment-request.component.html',
  styleUrls: ['./inventory-adjustment-request.component.less'],
})
export class InventoryInventoryAdjustmentRequestComponent implements OnInit {
  // Select control for clients and item families
  inventoryQuantityChangeTypes = InventoryQuantityChangeType;
  inventoryAdjustmentRequestStatuses = InventoryAdjustmentRequestStatus;
  // Form related data and functions
  searchForm: FormGroup;

  searching = false;

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

  inventoryAdjustmentRequestProcessForm: FormGroup;

  inventoryAdjustmentRequestModal: NzModalRef;

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
  ) {}
  ngOnInit() {
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
    this.inventoryAdjustmentRequestService
      .getInventoryAdjustmentRequests(
        this.searchForm.value.status,
        this.searchForm.value.itemName,
        this.searchForm.value.location,
        this.searchForm.value.inventoryQuantityChangeType,
        inventoryId,
      )
      .subscribe(inventoryAdjustmentRequestRes => {
        this.processInventoryAdjustmentRequestQueryResult(inventoryAdjustmentRequestRes);
        this.searching = false;
      });
  }

  processInventoryAdjustmentRequestQueryResult(inventoryAdjustmentRequestRes: InventoryAdjustmentRequest[]) {
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

    this.listOfAllInventoryAdjustmentRequests.forEach(inventoryAdjustmentRequest => {
      if (inventoryAdjustmentRequest.lpn && !existingLpn.has(inventoryAdjustmentRequest.lpn)) {
        this.filtersByLpn.push({
          text: inventoryAdjustmentRequest.lpn,
          value: inventoryAdjustmentRequest.lpn,
        });
        existingLpn.add(inventoryAdjustmentRequest.lpn);
      }
      if (inventoryAdjustmentRequest.item.id && !existingLpn.has(inventoryAdjustmentRequest.item.id)) {
        this.filtersByItem.push({
          text: inventoryAdjustmentRequest.item.name,
          value: inventoryAdjustmentRequest.item.id,
        });
        existingItemId.add(inventoryAdjustmentRequest.item.id);
      }
      if (
        inventoryAdjustmentRequest.itemPackageType.id &&
        !existingItemPackageTypeId.has(inventoryAdjustmentRequest.itemPackageType.id)
      ) {
        this.filtersByItemPackageType.push({
          text: inventoryAdjustmentRequest.itemPackageType.name,
          value: inventoryAdjustmentRequest.itemPackageType.id,
        });
        existingItemPackageTypeId.add(inventoryAdjustmentRequest.item.id);
      }
      if (inventoryAdjustmentRequest.location && !existingLocation.has(inventoryAdjustmentRequest.location)) {
        this.filtersByLocation.push({
          text: inventoryAdjustmentRequest.location,
          value: inventoryAdjustmentRequest.location,
        });
        existingLocation.add(inventoryAdjustmentRequest.location);
      }
      if (
        inventoryAdjustmentRequest.inventoryStatus.id &&
        !existingInventoryStatusId.has(inventoryAdjustmentRequest.inventoryStatus.id)
      ) {
        this.filtersByInventoryStatus.push({
          text: inventoryAdjustmentRequest.inventoryStatus.name,
          value: inventoryAdjustmentRequest.inventoryStatus.id,
        });
        existingInventoryStatusId.add(inventoryAdjustmentRequest.inventoryStatus.id);
      }
    });
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
  ) {
    this.selectedFiltersByLpn = selectedFiltersByLpn;
    this.selectedFiltersByItem = selectedFiltersByItem;
    this.selectedFiltersByItemPackageType = selectedFiltersByItemPackageType;
    this.selectedFiltersByLocation = selectedFiltersByLocation;
    this.selectedFiltersByInventoryStatus = selectedFiltersByInventoryStatus;
    this.sortAndFilter();
  }

  sortAndFilter() {
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

    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayInventoryAdjustmentRequests = data.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayInventoryAdjustmentRequests = data;
    }
  }

  initSearchForm() {
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
  ) {
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
  ) {
    console.log(`approved: ${approved}, comment: ${comment}`);
    this.inventoryAdjustmentRequestService
      .processInventoryAdjustmentRequest(inventoryAdjustmentRequest, approved, comment)
      .subscribe(inventoryAdjustmentRequestRes => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.refresh();
      });
  }
  refresh() {
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
