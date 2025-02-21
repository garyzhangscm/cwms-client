import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
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
    standalone: false
})
export class InventoryInventoryAdjustmentRequestComponent implements OnInit {
  listOfColumns: Array<ColumnItem<InventoryAdjustmentRequest>> = [
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
  searchForm!: UntypedFormGroup;

  searching = false;
  searchResult = '';

  requestInProcess = false;
  readyForProcessingRequest = false;

  // Table data for display
  listOfAllInventoryAdjustmentRequests: InventoryAdjustmentRequest[] = [];
  listOfDisplayInventoryAdjustmentRequests: InventoryAdjustmentRequest[] = [];
  currentProcessingRequest: InventoryAdjustmentRequest | undefined = undefined;

  inventoryAdjustmentRequestProcessForm!: UntypedFormGroup;

  inventoryAdjustmentRequestModal!: NzModalRef;

  isCollapse = false;

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private inventoryAdjustmentRequestService: InventoryAdjustmentRequestService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private messageService: NzMessageService,
    private modalService: NzModalService,
    private activatedRoute: ActivatedRoute,
    private utilService: UtilService,
    private userService: UserService,
  ) {
    userService.isCurrentPageDisplayOnly("/inventory/inventory-adjustment-request").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                          
  
  }
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


  }

  currentPageDataChange($event: InventoryAdjustmentRequest[]): void {
    this.listOfDisplayInventoryAdjustmentRequests = $event;
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
    tplRequestProcessModalFooter: TemplateRef<{}>,
  ): void {
    this.inventoryAdjustmentRequestProcessForm = this.fb.group({
      lpn: new UntypedFormControl({ value: inventoryAdjustmentRequest.lpn, disabled: true }),
      itemNumber: new UntypedFormControl({ value: inventoryAdjustmentRequest.item.name, disabled: true }),
      itemDescription: new UntypedFormControl({ value: inventoryAdjustmentRequest.item.description, disabled: true }),
      inventoryStatus: new UntypedFormControl({ value: inventoryAdjustmentRequest.inventoryStatus.name, disabled: true }),
      itemPackageType: new UntypedFormControl({ value: inventoryAdjustmentRequest.itemPackageType.name, disabled: true }),
      quantity: new UntypedFormControl({ value: inventoryAdjustmentRequest.quantity, disabled: true }),
      newQuantity: new UntypedFormControl({ value: inventoryAdjustmentRequest.newQuantity, disabled: true }),
      locationName: new UntypedFormControl({ value: inventoryAdjustmentRequest.location.name, disabled: true }),
      documentNumber: new UntypedFormControl({ value: inventoryAdjustmentRequest.documentNumber, disabled: true }),
      approved: new UntypedFormControl({ value: true, disabled: false }),
      comment: new UntypedFormControl({ value: inventoryAdjustmentRequest.comment, disabled: true }),
    });
    this.requestInProcess = false;
    this.readyForProcessingRequest = false;
    this.currentProcessingRequest = inventoryAdjustmentRequest;


    this.inventoryAdjustmentRequestModal = this.modalService.create({
      nzTitle: tplRequestProcessModalTitle,
      nzContent: tplRequestProcessModalContent,
      nzFooter: tplRequestProcessModalFooter,

      nzWidth: 1000,
    });


  }


  closeRequestProcessModal(): void {
    this.requestInProcess = false;
    this.currentProcessingRequest = undefined;
    this.inventoryAdjustmentRequestModal.destroy();

  }

  confirmRequest(): void {
    this.requestInProcess = true;
    this.processInventoryAdjustmentRequest(
      this.currentProcessingRequest!,
      this.inventoryAdjustmentRequestProcessForm.controls.approved.value,
      this.inventoryAdjustmentRequestProcessForm.controls.comment.value,
    );
  }


  processInventoryAdjustmentRequest(
    inventoryAdjustmentRequest: InventoryAdjustmentRequest,
    approved: boolean,
    comment: string,
  ): void {
    console.log(`approved: ${approved}, comment: ${comment}`);
    this.inventoryAdjustmentRequestService
      .processInventoryAdjustmentRequest(inventoryAdjustmentRequest, approved, comment)
      .subscribe(() => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.inventoryAdjustmentRequestModal.destroy();
        this.requestInProcess = false;
        this.currentProcessingRequest = undefined;
        this.refresh();
      },
        () => (this.requestInProcess = false));
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
