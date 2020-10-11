import { formatDate } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Inventory } from '../../inventory/models/inventory';
import { InventoryService } from '../../inventory/services/inventory.service';
import { Order } from '../models/order';
import { PickWork } from '../models/pick-work';
import { Shipment } from '../models/shipment';
import { ShipmentLine } from '../models/shipment-line';
import { ShortAllocation } from '../models/short-allocation';
import { ShortAllocationStatus } from '../models/short-allocation-status.enum';
import { Wave } from '../models/wave';
import { WaveStatus } from '../models/wave-status.enum';
import { PickService } from '../services/pick.service';
import { ShipmentLineService } from '../services/shipment-line.service';
import { ShortAllocationService } from '../services/short-allocation.service';
import { WaveService } from '../services/wave.service';

@Component({
  selector: 'app-outbound-wave',
  templateUrl: './wave.component.html',
  styleUrls: ['./wave.component.less'],
})
export class OutboundWaveComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private modalService: NzModalService,
    private waveService: WaveService,
    private shipmentLineService: ShipmentLineService,
    private pickService: PickService,
    private shortAllocationService: ShortAllocationService,
    private titleService: TitleService,
    private inventoryService: InventoryService,
    private messageService: NzMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  // Form related data and functions
  searchForm!: FormGroup;
  unpickForm!: FormGroup;
  searching = false;
  searchResult = '';
  tabSelectedIndex = 0;

  // Table data for display
  listOfAllWaves: Wave[] = [];
  listOfDisplayWaves: Wave[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  // checkbox - select all
  allChecked = false;
  indeterminate = false;
  isAllDisplayDataChecked = false;
  // list of checked checkbox
  mapOfCheckedId: { [key: string]: boolean } = {};
  // list of expanded row
  mapOfExpandedId: { [key: string]: boolean } = {};

  // list of record with allocation in process
  mapOfAllocationInProcessId: { [key: string]: boolean } = {};

  // list of record with printing in process
  mapOfPrintingInProcessId: { [key: string]: boolean } = {};

  // list of record with printing in process
  mapOfShipmentLines: { [key: string]: ShipmentLine[] } = {};
  mapOfPicks: { [key: string]: PickWork[] } = {};
  mapOfShortAllocations: { [key: string]: ShortAllocation[] } = {};

  mapOfPickedInventory: { [key: string]: Inventory[] } = {};

  shortAllocationStatus = ShortAllocationStatus;

  unpickModal!: NzModalRef;

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllWaves = [];
    this.listOfDisplayWaves = [];
  }

  search(expandedWaveId?: number, tabSelectedIndex?: number): void {
    this.searching = true;
    this.searchResult = '';
    this.waveService.getWaves(this.searchForm.controls.number.value).subscribe(
      waveRes => {
        this.listOfAllWaves = this.calculateQuantities(waveRes);
        this.listOfDisplayWaves = this.calculateQuantities(waveRes);

        this.collapseAllRecord(expandedWaveId);
        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: waveRes.length,
        });
        if (tabSelectedIndex) {
          this.tabSelectedIndex = tabSelectedIndex;
        }
      },
      () => {
        this.searching = false;
        this.searchResult = '';
      },
    );
  }

  collapseAllRecord(expandedWaveId?: number): void {
    this.listOfDisplayWaves.forEach(item => (this.mapOfExpandedId[item.id!] = false));
    if (expandedWaveId) {
      this.mapOfExpandedId[expandedWaveId] = true;
      this.listOfDisplayWaves.forEach(wave => {
        if (wave.id === expandedWaveId) {
          this.showWaveDetails(wave);
        }
      });
    }
  }

  calculateQuantities(waves: Wave[]): Wave[] {
    waves.forEach(wave => {
      wave.totalOrderCount = 0;
      wave.totalItemCount = 0;
      wave.totalQuantity = 0;
      wave.totalOpenQuantity = 0;
      wave.totalInprocessQuantity = 0;

      wave.totalStagedQuantity = 0;
      wave.totalShippedQuantity = 0;

      const existingItemIds = new Set();
      const existingOrderNumbers = new Set();

      wave.shipmentLines.forEach(shipmentLine => {
        existingItemIds.add(shipmentLine.orderLine.itemId);
        existingOrderNumbers.add(shipmentLine.orderNumber);

        wave.totalOpenQuantity! += shipmentLine.openQuantity;
        wave.totalInprocessQuantity! += shipmentLine.inprocessQuantity;

        wave.totalQuantity! += shipmentLine.quantity;
        wave.totalShippedQuantity! += shipmentLine.shippedQuantity;
      });
      wave.totalItemCount = existingItemIds.size;
      wave.totalOrderCount = existingOrderNumbers.size;
    });
    return waves;
  }

  showWaveDetails(wave: Wave): void {
    // When we expand the details for the order, load the picks and short allocation from the server
    if (this.mapOfExpandedId[wave.id!] === true) {
      this.showShipmentLines(wave);
      this.showPicks(wave);
      this.showShortAllocations(wave);
      this.showPickedInventory(wave);
    }
  }

  showShipmentLines(wave: Wave): void {
    this.shipmentLineService.getShipmentLinesByWave(wave.id!).subscribe(shipmentLineRes => {
      this.mapOfShipmentLines[wave.id!] = [...shipmentLineRes];
    });
  }
  showPicks(wave: Wave): void {
    this.pickService.getPicksByWave(wave.id!).subscribe(pickRes => {
      this.mapOfPicks[wave.id!] = [...pickRes];
    });
  }
  showShortAllocations(wave: Wave): void {
    this.shortAllocationService.getShortAllocationsByWave(wave.id!).subscribe(shortAllocationRes => {
      console.log(`shortAllocationRes.length: ${shortAllocationRes.length}`);
      this.mapOfShortAllocations[wave.id!] = shortAllocationRes.length === 0 ? [] : [...shortAllocationRes];
    });
  }
  showPickedInventory(wave: Wave): void {
    // Get all the picks and then load the pikced inventory
    this.pickService.getPicksByWave(wave.id!).subscribe(pickRes => {
      console.log(`pickRes.length: ${pickRes.length}`);
      if (pickRes.length === 0) {
        this.mapOfPickedInventory[wave.id!] = [];
      } else {
        this.pickService.getPickedInventories(pickRes).subscribe(pickedInventoryRes => {
          console.log(`pickedInventoryRes.length: ${pickedInventoryRes.length}`);
          this.mapOfPickedInventory[wave.id!] = pickedInventoryRes.length === 0 ? [] : [...pickedInventoryRes];
        });
      }
    });
  }

  openUnpickModal(
    wave: Wave,
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
          wave,
          inventory,
          this.unpickForm.controls.destinationLocation.value,
          this.unpickForm.controls.immediateMove.value,
        );
      },
      nzWidth: 1000,
    });
  }

  unpickInventory(wave: Wave, inventory: Inventory, destinationLocation: string, immediateMove: boolean): void {
    console.log(
      `Start to unpick ${JSON.stringify(inventory)} to ${destinationLocation}, immediateMove: ${immediateMove}`,
    );
    this.inventoryService.unpick(inventory, destinationLocation, immediateMove).subscribe(res => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      // refresh the picked inventory
      this.search(wave.id, 2);
    });
  }

  cancelShortAllocation(wave: Wave, shortAllocation: ShortAllocation): void {
    this.shortAllocationService.cancelShortAllocations([shortAllocation]).subscribe(shortAllocationRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      // refresh the picked inventory
      this.search(wave.id, 3);
    });
  }
  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayWaves.every(item => this.mapOfCheckedId[item.id!]);
    this.indeterminate =
      this.listOfDisplayWaves.some(item => this.mapOfCheckedId[item.id!]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayWaves.forEach(item => (this.mapOfCheckedId[item.id!] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data 
  }

  removeSelectedWaves(): void {
    // make sure we have at least one checkbox checked
    const selectedWaves = this.getSelectedWaves();
    if (selectedWaves.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.waveService.removeWaves(selectedWaves).subscribe(res => {
            console.log('selected wave removed');
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedWaves(): Wave[] {
    const selectedWaves: Wave[] = [];
    this.listOfAllWaves.forEach((wave: Wave) => {
      if (this.mapOfCheckedId[wave.id!] === true) {
        selectedWaves.push(wave);
      }
    });
    return selectedWaves;
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.wave'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.number) {
        this.searchForm.controls.number.setValue(params.number);
        this.search();
      }
    });
  }

  allocateWave(wave: Wave): void {
    this.waveService.allocateWave(wave).subscribe(waveRes => {
      this.messageService.success(this.i18n.fanyi('message.wave.allocated'));
      this.search();
    });
  }
  isWaveAllocatable(wave: Wave): boolean {
    return wave.totalOpenQuantity! > 0;
  }

  cancelPick(shipment: Shipment, pick: PickWork): void {
    this.pickService.cancelPick(pick).subscribe(pickRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      // refresh the picked inventory
      this.search(shipment.id, 1);
    });
  }
  printPickSheets(wave: Wave): void {
    this.mapOfPrintingInProcessId[wave.id!] = true;
    this.waveService.printPickSheet(wave);
    // purposely to show the 'loading' status of the print button
    // for at least 1 second. The above printWorkOrderPickSheet will
    // return immediately but the print job(or print preview page)
    // will start with some delay. During the delay, we will
    // display the 'print' button as 'Loading' status
    setTimeout(() => {
      this.mapOfPrintingInProcessId[wave.id!] = false;
    }, 1000);
  }
  confirmPicks(wave: Wave): void {
    this.router.navigateByUrl(`/outbound/pick/confirm?type=wave&id=${wave.id}`);
  }
}
