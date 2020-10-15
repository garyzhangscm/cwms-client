import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Inventory } from '../../inventory/models/inventory';
import { InventoryService } from '../../inventory/services/inventory.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { PickList } from '../models/pick-list';
import { PickWork } from '../models/pick-work';
import { OrderService } from '../services/order.service';
import { PickListService } from '../services/pick-list.service';
import { PickService } from '../services/pick.service';
import { ShortAllocationService } from '../services/short-allocation.service';

@Component({
  selector: 'app-outbound-pick-list',
  templateUrl: './pick-list.component.html',
  styleUrls: ['./pick-list.component.less'],
})
export class OutboundPickListComponent implements OnInit {

  listOfColumns: ColumnItem[] = [    
    {
          name: 'pick-list.number',
          showSort: true,
          sortOrder: null,
          sortFn: (a: PickList, b: PickList) => this.utilService.compareNullableString(a.number, b.number),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'pick-list.group-key',
          showSort: true,
          sortOrder: null,
          sortFn: (a: PickList, b: PickList) => this.utilService.compareNullableString(a.groupKey, b.groupKey),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'status',
          showSort: true,
          sortOrder: null,
          sortFn: (a: PickList, b: PickList) => this.utilService.compareNullableString(a.status.toString(), b.status.toString()),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
         }, {
          name: 'pick-list.totalPickCount',
          showSort: true,
          sortOrder: null,
          sortFn: (a: PickList, b: PickList) => this.utilService.compareNullableNumber(a.totalPickCount, b.totalPickCount),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
         }, {
          name: 'pick-list.totalItemCount',
          showSort: true,
          sortOrder: null,
          sortFn: (a: PickList, b: PickList) => this.utilService.compareNullableNumber(a.totalItemCount, b.totalItemCount),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
         }, {
          name: 'pick-list.totalLocationCount',
          showSort: true,
          sortOrder: null,
          sortFn: (a: PickList, b: PickList) => this.utilService.compareNullableNumber(a.totalLocationCount, b.totalLocationCount),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
         }, {
          name: 'pick-list.totalQuantity',
          showSort: true,
          sortOrder: null,
          sortFn: (a: PickList, b: PickList) => this.utilService.compareNullableNumber(a.totalQuantity, b.totalQuantity),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
         }, {
          name: 'pick-list.totalPickedQuantity',
          showSort: true,
          sortOrder: null,
          sortFn: (a: PickList, b: PickList) => this.utilService.compareNullableNumber(a.totalPickedQuantity, b.totalPickedQuantity),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, ];
        expandSet = new Set<number>();     
  // Form related data and functions
  searchForm!: FormGroup;
  unpickForm!: FormGroup;
  searching = false;
  tabSelectedIndex = 0;
  // Table data for display
  listOfAllPickLists: PickList[] = [];
  listOfDisplayPickLists: PickList[] = [];
  

  

  // list of record with printing in process
  mapOfPrintingInProcessId: { [key: string]: boolean } = {};

  mapOfPicks: { [key: string]: PickWork[] } = {};

  // list of record with printing in process

  mapOfPickedInventory: { [key: string]: Inventory[] } = {};

  unpickModal!: NzModalRef;

  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private modalService: NzModalService,
    private messageService: NzMessageService,
    private router: Router,
    private pickService: PickService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private inventoryService: InventoryService,
    private pickListService: PickListService,
    private utilService: UtilService,
  ) {}
  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.pick-list'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
    });

    // IN case we get the number passed in, refresh the display
    // and show the order information
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.number) {
        this.searchForm.controls.number.setValue(params.number);
        this.search();
      }
    });
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllPickLists = [];
    this.listOfDisplayPickLists = [];
  }

  search(expandedPickListId?: number, tabSelectedIndex?: number): void {
    this.searching = true;
    this.pickListService.getPickLists(this.searchForm.controls.number.value).subscribe(pickListRes => {
      this.listOfAllPickLists = this.calculateQuantities(pickListRes);
      this.listOfDisplayPickLists = this.calculateQuantities(pickListRes);

      this.collapseAllRecord(expandedPickListId);
      this.searching = false;
      if (tabSelectedIndex) {
        this.tabSelectedIndex = tabSelectedIndex;
      }
    });
  }

  collapseAllRecord(expandedPickListId?: number): void {
    this.listOfDisplayPickLists.forEach(item => (this.expandSet.delete(item.id)));
    if (expandedPickListId) {
      this.expandSet.add(expandedPickListId);
      this.listOfDisplayPickLists.forEach(pickList => {
        if (pickList.id === expandedPickListId) {
          this.showPickListDetails(pickList);
        }
      });
    }
  }

  calculateQuantities(pickLists: PickList[]): PickList[] {
    pickLists.forEach(pickList => {
      const existingItemIds = new Set();
      const existingLocationIds = new Set();

      pickList.totalPickCount = pickList.picks.length;
      pickList.totalItemCount = 0;
      pickList.totalLocationCount = 0;
      pickList.totalQuantity = 0;
      pickList.totalPickedQuantity = 0;

      pickList.picks.forEach(pick => {
        pickList.totalQuantity! += pick.quantity;
        pickList.totalPickedQuantity! += pick.pickedQuantity;

        if (!existingItemIds.has(pick.itemId)) {
          existingItemIds.add(pick.itemId);
        }
        if (!existingLocationIds.has(pick.sourceLocationId)) {
          existingLocationIds.add(pick.sourceLocationId);
        }
      });

      pickList.totalItemCount = existingItemIds.size;
      pickList.totalLocationCount = existingLocationIds.size;
    });
    return pickLists;
  }
  
  printPickSheets(pickList: PickList): void {
    this.mapOfPrintingInProcessId[pickList.id] = true;
    this.pickListService.printPickListPickSheet(pickList);
    // purposely to show the 'loading' status of the print button
    // for at least 1 second. The above printWorkOrderPickSheet will
    // return immediately but the print job(or print preview page)
    // will start with some delay. During the delay, we will
    // display the 'print' button as 'Loading' status
    setTimeout(() => {
      this.mapOfPrintingInProcessId[pickList.id] = false;
    }, 1000);
  }
  confirmPicks(pickList: PickList): void {
    this.router.navigateByUrl(`/outbound/pick/confirm?type=pickList&id=${pickList.id}`);
  }
  showPickListDetails(pickList: PickList): void {
    
    // When we expand the details for the order, load the picks and short allocation from the server
    if (this.expandSet.has(pickList.id)) {
      this.showPicks(pickList);
      this.showPickedInventory(pickList);
    }
  }
  showPicks(pickList: PickList): void {
    this.pickService.getPicksByPickList(pickList.id).subscribe(pickRes => {
      this.mapOfPicks[pickList.id] = [...pickRes];
    });
  }
  showPickedInventory(pickList: PickList): void {
    // Get all the picks and then load the pikced inventory
    this.pickService.getPicksByPickList(pickList.id).subscribe(pickRes => {
      if (pickRes.length === 0) {
        this.mapOfPickedInventory[pickList.id] = [];
      } else {
        this.pickService.getPickedInventories(pickRes).subscribe(pickedInventoryRes => {
          this.mapOfPickedInventory[pickList.id] = [...pickedInventoryRes];
        });
      }
    });
  }

  cancelPick(pickList: PickList, pick: PickWork): void {
    this.pickService.cancelPick(pick).subscribe(pickRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search(pickList.id, 0);
    });
  }
  openUnpickModal(
    pickList: PickList,
    inventory: Inventory,
    tplUnpickModalTitle: TemplateRef<{}>,
    tplUnpickModalContent: TemplateRef<{}>,
  ): void {
    this.unpickForm = this.fb.group({
      lpn: new FormControl({ value: inventory.lpn, disabled: true }),
      itemNumber: new FormControl({ value: inventory.item!.name, disabled: true }),
      itemDescription: new FormControl({ value: inventory.item!.description, disabled: true }),
      inventoryStatus: new FormControl({ value: inventory.inventoryStatus!.name, disabled: true }),
      itemPackageType: new FormControl({ value: inventory.itemPackageType!.name, disabled: true }),
      quantity: new FormControl({ value: inventory.quantity, disabled: true }),
      locationName: new FormControl({ value: inventory.location!.name, disabled: true }),
      destinationLocation: [null],
      immediateMove: [null],
    });

    // Load the location
    this.unpickModal = this.modalService.create({
      nzTitle: tplUnpickModalTitle,
      nzContent: tplUnpickModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.unpickModal.destroy();
        // this.refreshReceiptResults();
      },
      nzOnOk: () => {
        this.unpickInventory(
          pickList,
          inventory,
          this.unpickForm.controls.destinationLocation.value,
          this.unpickForm.controls.immediateMove.value,
        );
      },
      nzWidth: 1000,
    });
  }

  unpickInventory(pickList: PickList, inventory: Inventory, destinationLocation: string, immediateMove: boolean): void {
    console.log(
      `Start to unpick ${JSON.stringify(inventory)} to ${destinationLocation}, immediateMove: ${immediateMove}`,
    );
    this.inventoryService.unpick(inventory, destinationLocation, immediateMove).subscribe(res => {
      console.log(`unpick is done`);
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      // refresh the picked inventory
      this.search(pickList.id, 1);
    });
  }
  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }
}
