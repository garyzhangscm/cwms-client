import { Component, OnInit, TemplateRef } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { I18NService } from '@core';
import { NzModalService, NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { Router, ActivatedRoute } from '@angular/router';
import { PickService } from '../services/pick.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { PickListService } from '../services/pick-list.service';
import { PickList } from '../models/pick-list';
import { PickWork } from '../models/pick-work';
import { Inventory } from '../../inventory/models/inventory';
import { CartonizationService } from '../services/cartonization.service';
import { Cartonization } from '../models/cartonization';

@Component({
  selector: 'app-outbound-cartonization',
  templateUrl: './cartonization.component.html',
  styleUrls: ['./cartonization.component.less'],
})
export class OutboundCartonizationComponent implements OnInit {
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
    private cartonizationService: CartonizationService,
  ) {}

  // Form related data and functions
  searchForm: FormGroup;
  unpickForm: FormGroup;
  searching = false;
  tabSelectedIndex = 0;
  // Table data for display
  listOfAllCartonization: Cartonization[] = [];
  listOfDisplayCartonization: Cartonization[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  // list of expanded row
  mapOfExpandedId: { [key: string]: boolean } = {};

  // list of record with printing in process
  mapOfPrintingInProcessId: { [key: string]: boolean } = {};

  mapOfPicks: { [key: string]: PickWork[] } = {};

  // list of record with printing in process

  mapOfPickedInventory: { [key: string]: Inventory[] } = {};

  unpickModal: NzModalRef;
  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.cartonization'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      status: [null],
      cartonName: [null],
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
    this.listOfAllCartonization = [];
    this.listOfDisplayCartonization = [];
  }

  search(expandedCartonizationId?: number, tabSelectedIndex?: number): void {
    this.searching = true;
    this.cartonizationService
      .getAll(
        this.searchForm.controls.number.value,
        this.searchForm.controls.status.value,
        this.searchForm.controls.cartonName.value,
      )
      .subscribe(cartonizationRes => {
        this.listOfAllCartonization = this.calculateQuantities(cartonizationRes);
        this.listOfDisplayCartonization = this.calculateQuantities(cartonizationRes);

        this.collapseAllRecord(expandedCartonizationId);
        this.searching = false;
        if (tabSelectedIndex) {
          this.tabSelectedIndex = tabSelectedIndex;
        }
      });
  }

  collapseAllRecord(expandedCartonizationId?: number) {
    this.listOfDisplayCartonization.forEach(item => (this.mapOfExpandedId[item.id] = false));
    if (expandedCartonizationId) {
      this.mapOfExpandedId[expandedCartonizationId] = true;
      this.listOfDisplayCartonization.forEach(cartonization => {
        if (cartonization.id === expandedCartonizationId) {
          this.showCartonizationDetails(cartonization);
        }
      });
    }
  }

  calculateQuantities(cartonizationList: Cartonization[]): Cartonization[] {
    cartonizationList.forEach(cartonization => {
      const existingItemIds = new Set();
      const existingLocationIds = new Set();

      cartonization.totalPickCount = cartonization.picks.length;
      cartonization.totalItemCount = 0;
      cartonization.totalLocationCount = 0;
      cartonization.totalQuantity = 0;
      cartonization.totalPickedQuantity = 0;

      cartonization.picks.forEach(pick => {
        cartonization.totalQuantity += pick.quantity;
        cartonization.totalPickedQuantity += pick.pickedQuantity;

        if (!existingItemIds.has(pick.itemId)) {
          existingItemIds.add(pick.itemId);
        }
        if (!existingLocationIds.has(pick.sourceLocationId)) {
          existingLocationIds.add(pick.sourceLocationId);
        }
      });

      cartonization.totalItemCount = existingItemIds.size;
      cartonization.totalLocationCount = existingLocationIds.size;
    });
    return cartonizationList;
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayCartonization = this.listOfAllCartonization.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayCartonization = this.listOfAllCartonization;
    }
  }

  printPickSheets(cartonization: Cartonization) {
    this.mapOfPrintingInProcessId[cartonization.id] = true;
    this.cartonizationService.printCartonizationPickSheet(cartonization);
    // purposely to show the 'loading' status of the print button
    // for at least 1 second. The above printWorkOrderPickSheet will
    // return immediately but the print job(or print preview page)
    // will start with some delay. During the delay, we will
    // display the 'print' button as 'Loading' status
    setTimeout(() => {
      this.mapOfPrintingInProcessId[cartonization.id] = false;
    }, 1000);
  }
  confirmPicks(cartonization: Cartonization) {
    this.router.navigateByUrl(`/outbound/pick/confirm?type=cartonization&id=${cartonization.id}`);
  }
  showCartonizationDetails(cartonization: Cartonization) {
    // When we expand the details for the order, load the picks and short allocation from the server
    if (this.mapOfExpandedId[cartonization.id] === true) {
      this.showPicks(cartonization);
      this.showPickedInventory(cartonization);
    }
  }
  showPicks(cartonization: Cartonization) {
    this.pickService.getPicksByCartonization(cartonization.id).subscribe(pickRes => {
      this.mapOfPicks[cartonization.id] = [...pickRes];
    });
  }
  showPickedInventory(cartonization: Cartonization) {
    // Get all the picks and then load the pikced inventory
    this.pickService.getPicksByCartonization(cartonization.id).subscribe(pickRes => {
      if (pickRes.length === 0) {
        this.mapOfPickedInventory[cartonization.id] = [];
      } else {
        this.pickService.getPickedInventories(pickRes).subscribe(pickedInventoryRes => {
          this.mapOfPickedInventory[cartonization.id] = [...pickedInventoryRes];
        });
      }
    });
  }

  cancelPick(cartonization: Cartonization, pick: PickWork) {
    this.pickService.cancelPick(pick).subscribe(pickRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search(cartonization.id, 0);
    });
  }
  openUnpickModal(
    cartonization: Cartonization,
    inventory: Inventory,
    tplUnpickModalTitle: TemplateRef<{}>,
    tplUnpickModalContent: TemplateRef<{}>,
  ) {
    this.unpickForm = this.fb.group({
      lpn: new FormControl({ value: inventory.lpn, disabled: true }),
      itemNumber: new FormControl({ value: inventory.item.name, disabled: true }),
      itemDescription: new FormControl({ value: inventory.item.description, disabled: true }),
      inventoryStatus: new FormControl({ value: inventory.inventoryStatus.name, disabled: true }),
      itemPackageType: new FormControl({ value: inventory.itemPackageType.name, disabled: true }),
      quantity: new FormControl({ value: inventory.quantity, disabled: true }),
      locationName: new FormControl({ value: inventory.location.name, disabled: true }),
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
          cartonization,
          inventory,
          this.unpickForm.controls.destinationLocation.value,
          this.unpickForm.controls.immediateMove.value,
        );
      },
      nzWidth: 1000,
    });
  }

  unpickInventory(
    cartonization: Cartonization,
    inventory: Inventory,
    destinationLocation: string,
    immediateMove: boolean,
  ) {
    console.log(
      `Start to unpick ${JSON.stringify(inventory)} to ${destinationLocation}, immediateMove: ${immediateMove}`,
    );
    this.inventoryService.unpick(inventory, destinationLocation, immediateMove).subscribe(res => {
      console.log(`unpick is done`);
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      // refresh the picked inventory
      this.search(cartonization.id, 1);
    });
  }
}
