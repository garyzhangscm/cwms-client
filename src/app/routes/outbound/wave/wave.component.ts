import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core'; 
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, User, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { PrintPageSize } from '../../common/models/print-page-size.enum';
import { PrintingService } from '../../common/services/printing.service';
import { Inventory } from '../../inventory/models/inventory';
import { InventoryService } from '../../inventory/services/inventory.service';
import { ReportOrientation } from '../../report/models/report-orientation.enum';
import { ReportType } from '../../report/models/report-type.enum';
import { TrailerAppointment } from '../../transportation/models/trailer-appointment';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service'; 
import { WorkTaskService } from '../../work-task/services/work-task.service';
import { PickGroupType } from '../models/pick-group-type.enum';
import { PickStatus } from '../models/pick-status.enum';
import { PickWork } from '../models/pick-work'; 
import { ShipmentLine } from '../models/shipment-line';
import { ShortAllocation } from '../models/short-allocation';
import { ShortAllocationStatus } from '../models/short-allocation-status.enum';
import { Wave } from '../models/wave'; 
import { WaveStatus } from '../models/wave-status.enum';
import { BulkPickService } from '../services/bulk-pick.service';
import { PickListService } from '../services/pick-list.service';
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

  listOfColumns: Array<ColumnItem<Wave>> = [
    {
      name: 'wave.number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Wave, b: Wave) => this.utilService.compareNullableString(a.number, b.number),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'wave.status',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Wave, b: Wave) => this.utilService.compareNullableString(a.status?.toString(), b.status?.toString()),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'wave.totalOrderCount',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Wave, b: Wave) => this.utilService.compareNullableNumber(a.totalOrderCount, b.totalOrderCount),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'wave.totalOrderLineCount',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Wave, b: Wave) => this.utilService.compareNullableNumber(a.totalOrderLineCount, b.totalOrderLineCount),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'wave.totalItemCount',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Wave, b: Wave) => this.utilService.compareNullableNumber(a.totalItemCount, b.totalItemCount),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'wave.totalQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Wave, b: Wave) => this.utilService.compareNullableNumber(a.totalQuantity, b.totalQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'wave.totalOpenQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Wave, b: Wave) => this.utilService.compareNullableNumber(a.totalOpenQuantity, b.totalOpenQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'wave.totalInprocessQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Wave, b: Wave) => this.utilService.compareNullableNumber(a.totalInprocessQuantity, b.totalInprocessQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'wave.totalStagedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Wave, b: Wave) => this.utilService.compareNullableNumber(a.totalStagedQuantity, b.totalStagedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'wave.totalShippedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Wave, b: Wave) => this.utilService.compareNullableNumber(a.totalShippedQuantity, b.totalShippedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];

  listOfSelection = [
    {
      text: this.i18n.fanyi(`select-all-rows`),
      onSelect: () => {
        this.onAllChecked(true);
      }
    },
  ];
  setOfCheckedId = new Set<number>();
  checked = false;
  indeterminate = false;
  expandSet = new Set<number>();
  pickGroupTypes = PickGroupType;

  pickTableExpandSet = new Set<number>();
  pickStatuses = PickStatus;
  currentWave?: Wave;
  currentPick?: PickWork;
  
  userPermissionMap: Map<string, boolean> = new Map<string, boolean>([  
    ['cancel-single-pick', false], 
    ['confirm-multiple-pick', false], 
    ['cancel-multiple-pick', false], 
    ['allocate-short-allocation', false], 
    ['create-work-order', false], 
    ['cancel-short-allocation', false], 
    ['allocate-wave', false], 
    ['cancel-wave', false], 
  ]);

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private waveService: WaveService,
    private shipmentLineService: ShipmentLineService,
    private pickService: PickService,
    private shortAllocationService: ShortAllocationService,
    private titleService: TitleService,
    private inventoryService: InventoryService,
    private messageService: NzMessageService,
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private utilService: UtilService,
    private bulkPickService: BulkPickService,
    private workTaskService: WorkTaskService,
    private pickListService: PickListService,
    private printingService: PrintingService,
  ) { 
    userService.isCurrentPageDisplayOnly("/outbound/wave").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                 
    userService.getUserPermissionByWebPage("/outbound/wave").subscribe({
      next: (userPermissionRes) => {
        userPermissionRes.forEach(
          userPermission => this.userPermissionMap.set(userPermission.permission.name, userPermission.allowAccess)
        )
      }
    });                  
  }

  // Form related data and functions
  searchForm!: UntypedFormGroup;
  unpickForm!: UntypedFormGroup;
  searching = false;
  searchResult = '';
  tabSelectedIndex = 0;

  // Table data for display
  listOfAllWaves: Wave[] = [];
  listOfDisplayWaves: Wave[] = [];
  waveStatuses = WaveStatus;


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

  selectedUserId?: number;

  @ViewChild('userTable', { static: false }) 
  private userTable!: STComponent;

  userTablecolumns: STColumn[] = [
    { title: '', index: 'id', type: 'radio', width: 70 },
    { title: this.i18n.fanyi('username'),  index: 'username' }, 
    { title: this.i18n.fanyi('firstname'),  index: 'firstname' }, 
    { title: this.i18n.fanyi('lastname'),  index: 'lastname' }, 
  ];
 
  // Form related data and functions
  queryUserModal!: NzModalRef;
  searchUserForm!: UntypedFormGroup;
  
  
  listOfAllAssignableUsers: User[] = []; 


  isSpinning = false;
  

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllWaves = [];
    this.listOfDisplayWaves = [];
  }

  search(expandedWaveId?: number, tabSelectedIndex?: number): void {
    this.isSpinning = true;
    this.searchResult = '';
    this.waveService.getWaves(this.searchForm.controls.number.value).subscribe(
      waveRes => {
        this.listOfAllWaves = this.calculateQuantities(waveRes);
        this.listOfDisplayWaves = this.calculateQuantities(waveRes);

        this.collapseAllRecord(expandedWaveId);
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: waveRes.length,
        });
        if (tabSelectedIndex) {
          this.tabSelectedIndex = tabSelectedIndex;
        }
      },
      () => {
        this.isSpinning = false;
        this.searchResult = '';
      },
    );
  }

  collapseAllRecord(expandedWaveId?: number): void {
    this.listOfDisplayWaves.forEach(item => (this.expandSet.delete(item.id!)));
    if (expandedWaveId) {
      this.expandSet.add(expandedWaveId);
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
    if (this.expandSet.has(wave.id!)) {
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
    this.pickService.getPicksByWave(wave.id!).subscribe({
      next: (pickRes) => {
        // get all the single pick and add it to the result
        // this.mapOfPicks[wave.id!] = pickRes.filter(pick => this.pickService.isSinglePick(pick));
        // get all the bulk pick
        // console.log(`start to setup ${pickRes.length}`);
        // group the picks into 
        // 1. single pick
        // 2. bulk pick
        // 3. list pick
        this.pickService.setupPicksForDisplay(pickRes).then(
          pickWorks => { 
            this.mapOfPicks[wave.id!] = pickWorks;

            // setup the work task related information
            // this.setupWorkTaskInformationForPicks(this.mapOfPicks[wave.id!]);
          }
        );


      }
    });
  }

  setupWorkTaskInformationForPicks(picks: PickWork[] ) {

    picks.forEach(
      pick => this.setupWorkTaskInformationForPick(pick)
    )
  }
  setupWorkTaskInformationForPick(pick: PickWork) {
    if (pick.pickGroupType == PickGroupType.BULK_PICK) {
      // console.log(`start to setup work task for bulk pick`); 
    }
    else if (pick.pickGroupType == null) {
      
    }
    
  }

  showShortAllocations(wave: Wave): void {
    this.shortAllocationService.getShortAllocationsByWave(wave.id!).subscribe(shortAllocationRes => {
      // console.log(`shortAllocationRes.length: ${shortAllocationRes.length}`);
      this.mapOfShortAllocations[wave.id!] = shortAllocationRes.length === 0 ? [] : [...shortAllocationRes];
    });
  }
  showPickedInventory(wave: Wave): void {
    // Get all the picks and then load the pikced inventory
    this.pickService.getPicksByWave(wave.id!).subscribe(pickRes => {
      //console.log(`pickRes.length: ${pickRes.length}`);
      if (pickRes.length === 0) {
        this.mapOfPickedInventory[wave.id!] = [];
      } else {
        this.pickService.getPickedInventories(pickRes).subscribe(pickedInventoryRes => {
          //console.log(`pickedInventoryRes.length: ${pickedInventoryRes.length}`);
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
      lpn: new UntypedFormControl({ value: inventory.lpn, disabled: true }),
      itemNumber: new UntypedFormControl({ value: inventory.item!.name, disabled: true }),
      itemDescription: new UntypedFormControl({ value: inventory.item!.description, disabled: true }),
      inventoryStatus: new UntypedFormControl({ value: inventory.inventoryStatus!.name, disabled: true }),
      itemPackageType: new UntypedFormControl({ value: inventory.itemPackageType!.name, disabled: true }),
      quantity: new UntypedFormControl({ value: inventory.quantity, disabled: true }),
      locationName: new UntypedFormControl({ value: inventory.location!.name, disabled: true }),
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
    // console.log(
    //  `Start to unpick ${JSON.stringify(inventory)} to ${destinationLocation}, immediateMove: ${immediateMove}`,
    //);
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

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfDisplayWaves!.forEach(item => this.updateCheckedSet(item.id!, value));
    this.refreshCheckedStatus();
  }

  currentPageDataChange($event: Wave[]): void {
    this.listOfDisplayWaves! = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfDisplayWaves!.every(item => this.setOfCheckedId.has(item.id!));
    this.indeterminate = this.listOfDisplayWaves!.some(item => this.setOfCheckedId.has(item.id!)) && !this.checked;
  }

  onExpandChange(id: number, wave: Wave,checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);

      this.showWaveDetails(wave);
    } else {
      this.expandSet.delete(id);
    }
  }
  onPickTableExpandChange(id: number, pick: PickWork,checked: boolean): void {
    if (checked) {
      this.pickTableExpandSet.add(id); 
    } else {
      this.pickTableExpandSet.delete(id);
    }
  } 

  removeSelectedWaves(): void {
    // make sure we have at least one checkbox checked
    const selectedWaves = this.getSelectedWaves();
    if (selectedWaves.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkDanger: true,
        nzOnOk: () => {
          this.waveService.removeWaves(selectedWaves).subscribe(res => {
            // console.log('selected wave removed');
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
      if (this.setOfCheckedId.has(wave.id!)) {
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
    this.isSpinning = true;

    this.waveService.allocateWave(wave).subscribe({

      next: () => {
        this.messageService.success(this.i18n.fanyi('message.wave.allocated'));
        this.isSpinning = false;
        this.search();
      }, 
      error: () => this.isSpinning = false

    }); 
  }
  cancelWave(wave: Wave): void {
    this.isSpinning = true;

    this.waveService.cancelWave(wave).subscribe({

      next: () => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.isSpinning = false;
        this.search();
      }, 
      error: () => this.isSpinning = false

    }); 
  }
  isWaveAllocatable(wave: Wave): boolean {
    return wave.totalOpenQuantity! > 0 && wave.status != WaveStatus.COMPLETED && wave.status != WaveStatus.CANCELLED;
  }
  isWaveCancellable(wave: Wave): boolean {
    return wave.status != WaveStatus.COMPLETED && wave.status != WaveStatus.CANCELLED;
  }
/**
 *  
  cancelPick(wave: Wave, pick: PickWork, errorLocation: boolean, generateCycleCount: boolean): void {
    
    this.isSpinning = true;
    if (pick.pickGroupType == PickGroupType.BULK_PICK) {
      // console.log(`start to assign user to bulk pick`);
      this.bulkPickService.cancelBulkPick(pick.id, errorLocation, generateCycleCount).subscribe({
        next: (bulkPick) => {
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          // refresh the picked inventory
          this.search(wave.id, 1);
        }, 
        error: () => this.isSpinning = false
      })
    }
    else if (pick.pickGroupType == PickGroupType.LIST_PICK) {
      // console.log(`start to assign user to bulk pick`);
      this.pickListService.cancelPickList(pick.id, errorLocation, generateCycleCount).subscribe({
        next: (pickList) => {
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          // refresh the picked inventory
          this.search(wave.id, 1);
        }, 
        error: () => this.isSpinning = false
      })
    }
    else if (pick.pickGroupType == null) { 
      this.pickService.cancelPick(pick, errorLocation, generateCycleCount).subscribe({
        next: () => {
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          // refresh the picked inventory
          this.search(wave.id, 1);
        }, 
        error: () => this.isSpinning = false
      })
    }
     
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

  releasePick(wave: Wave, pick: PickWork) {
    this.isSpinning = true;
    // console.log(`start to release pick \n ${JSON.stringify(pick)}`);

    if (pick.pickGroupType == PickGroupType.BULK_PICK) {
        this.bulkPickService.releasePick(pick.id).subscribe({
          next: () => { 
            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            // refresh the picked inventory
            this.search(wave.id, 1); 
          }, 
          error: () => this.isSpinning = false
        })
    }
    else if (pick.pickGroupType == null) {
      this.pickService.releasePick(pick.id).subscribe({
        next: () => { 
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          // refresh the picked inventory
          this.search(wave.id, 1); 
        }, 
        error: () => this.isSpinning = false
      })
  }
  }

  assignUser(wave: Wave, pick: PickWork, userId?: number) {
    // console.log(`start to assign user with id ${userId}`);
    if (userId == null) {
    //  console.log(`no user is selected, do nothing`)
    }
    else {
      this.isSpinning = true;
      if (pick.pickGroupType == PickGroupType.BULK_PICK) {
        // console.log(`start to assign user to bulk pick`);
        this.bulkPickService.assignUser(pick.id, userId).subscribe({
          next: (bulkPick) => {
            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            // refresh the picked inventory
            this.search(wave.id, 1);  
          }, 
          error: () => this.isSpinning = false
        })
      }
      else if (pick.pickGroupType == null) {
        // console.log(`start to assign user to pick`);
        this.pickService.assignUser(pick.id, userId).subscribe({
          next: () => {
            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            // refresh the picked inventory
            this.search(wave.id, 1);  
          }, 
          error: () => this.isSpinning = false
        })
      }
    }
  }

  unacknowledgeWorkTask(wave: Wave, workTaskId: number) {  
      this.isSpinning = true; 
      this.workTaskService.unacknowledgeWorkTask(workTaskId, false).subscribe({
        next: () => {
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          // refresh the picked inventory
          this.search(wave.id, 1);  
        }, 
        error: () => this.isSpinning = false
      }) ;
  }

  unassignUser(wave: Wave, pick: PickWork) { 
      this.isSpinning = true;
      if (pick.pickGroupType == PickGroupType.BULK_PICK) {
        // console.log(`start to unassign user to bulk pick`);
        this.bulkPickService.unassignUser(pick.id).subscribe({
          next: (bulkPick) => {
            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            // refresh the picked inventory
            this.search(wave.id, 1);  
          }, 
          error: () => this.isSpinning = false
        })
      }
      else if (pick.pickGroupType == null) {
        // console.log(`start to unassign user to pick`);
        this.pickService.unassignUser(pick.id).subscribe({
          next: () => {
            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            // refresh the picked inventory
            this.search(wave.id, 1);  
          }, 
          error: () => this.isSpinning = false
        })
      } 
  }
  openUserQueryModal(
    wave: Wave,
    pick: PickWork, 
    tplAssignUserModalTitle: TemplateRef<{}>,
    tplAssignUserModalContent: TemplateRef<{}>,
    tplAssignUserModalFooter: TemplateRef<{}>,
  ): void {
 
    this.currentWave = wave;
    this.currentPick = pick;

    this.listOfAllAssignableUsers = []; 

    this.selectedUserId = undefined;

    this.createQueryForm();

    // show the model
    this.queryUserModal = this.modalService.create({
      nzTitle: tplAssignUserModalTitle,
      nzContent: tplAssignUserModalContent,
      nzFooter: tplAssignUserModalFooter,

      nzWidth: 1000,
    });

  }
  
  searchUser(): void {
    this.searching = true;
    this.selectedUserId = undefined;
    if (this.currentPick?.workTaskId == null) {
      // if we can't get the current work task 
      // return an empty user result set
      this.listOfAllAssignableUsers = [];
      return;
    }
    this.userService
      .getUsers( 
        this.searchForm.value.username, 
        undefined,
        undefined,
        this.searchForm.value.firstname,
        this.searchForm.value.lastname,
        this.currentPick.workTaskId
      )
      .subscribe({
        next: (userRes) => {

          this.listOfAllAssignableUsers = userRes; 

          this.searching = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: userRes.length,
          });
        }, 
        error: () => {
          this.searching = false;
          this.searchResult = '';
        },
      });
  } 

 
  createQueryForm(): void {
    // initiate the search form
    this.searchUserForm = this.fb.group({ 
      username: [null], 
      firstname: [null], 
      lastname: [null],
    });
 
  }
  closeUserQueryModal(): void {
    this.queryUserModal.destroy();
  }
  returnUserResult(): void {
    // get the selected record
    if (this.isAnyUserRecordChecked()) {
      this.assignUser(this.currentWave!, this.currentPick!, this.selectedUserId);
    } else {
      console.log(`no user is selected, do nothing`)
    }
    this.queryUserModal.destroy();

  } 

  change(ret: STChange): void {
    console.log('change', ret);
    if (ret.type == 'radio') {
      this.selectedUserId = undefined;
      if (ret.radio != null && ret.radio!.id != null) {
        console.log(`chosen user ${ret.radio!.id} / ${ret.radio!.username}`);
        this.selectedUserId = ret.radio!.id;
      }
    }
  }
  isAnyUserRecordChecked() {
    return  this.selectedUserId != undefined;;
  }

**/
  
  @ViewChild('stPick', { static: false })
  stPick!: STComponent;
  pickColumns: STColumn[] = [ 
    { title: '', index: 'number', type: 'checkbox' },

    { title: this.i18n.fanyi("pick.number"), index: 'number' , width: 150, },   
    { title: this.i18n.fanyi("status"), render: 'statusColumn', width: 110,  },   
    { title: this.i18n.fanyi("type"), render: 'typeColumn', width: 110,  },  
    { title: this.i18n.fanyi("order.number"), index: 'orderNumber' , width: 150, },   
    { title: this.i18n.fanyi("work-task.number"), render: 'workTaskColumn' , width: 210, },  
    // { title: this.i18n.fanyi("assign"), render: 'assignColumn'  },  
    // { title: this.i18n.fanyi("currentUser"), index: 'workTask.currentUser.username'  },  
    { title: this.i18n.fanyi("sourceLocation"), index: 'sourceLocation.name'  },  
    { title: this.i18n.fanyi("destinationLocation"), index: 'destinationLocation.name'  },     
    { title: this.i18n.fanyi("item"), index: 'item.name'  },   
    { title: this.i18n.fanyi("item.description"), index: 'item.description'  },   
    { title: this.i18n.fanyi("pick.quantity"), index: 'quantity'  },   
    { title: this.i18n.fanyi("pick.pickedQuantity"), index: 'pickedQuantity'  },    
    {
      title: this.i18n.fanyi("action"), fixed: 'right', width: 210, 
      render: 'actionColumn',
      iif: () => !this.displayOnly
    }, 
   
  ];

  @ViewChild('stInnerPick', { static: false })
  stInnerPick!: STComponent;
  innerPickColumns: STColumn[] = [  
    { title: this.i18n.fanyi("pick.number"), index: 'number'  },   
    { title: this.i18n.fanyi("status"), render: 'innerPickStatusColumn',  },   
    { title: this.i18n.fanyi("order.number"), index: 'orderNumber'  },   
    { title: this.i18n.fanyi("sourceLocation"), index: 'sourceLocation.name'  },  
    { title: this.i18n.fanyi("destinationLocation"), index: 'destinationLocation.name'  },     
    { title: this.i18n.fanyi("item"), index: 'item.name'  },   
    { title: this.i18n.fanyi("item.description"), index: 'item.description'  },   
    { title: this.i18n.fanyi("pick.quantity"), index: 'quantity'  },   
    { title: this.i18n.fanyi("pick.pickedQuantity"), index: 'pickedQuantity'  },     
    { title: this.i18n.fanyi("action"), render: 'innerPickActionColumn'  },     
   
  ];
  
  releasePick(wave: Wave, pick: PickWork) {
    this.isSpinning = true;
    // console.log(`start to release pick \n ${JSON.stringify(pick)}`);

    if (pick.pickGroupType == PickGroupType.BULK_PICK) {
        this.bulkPickService.releasePick(pick.id).subscribe({
          next: () => { 
            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            // refresh the picked inventory
            this.search(); 
          }, 
          error: () => this.isSpinning = false
        })
    }
    else if (pick.pickGroupType == null) {
      this.pickService.releasePick(pick.id).subscribe({
        next: () => { 
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          // refresh the picked inventory
          this.search(); 
        }, 
        error: () => this.isSpinning = false
      })
  }
  }
  
  openUserQueryModal(
    wave: Wave,
    pick: PickWork, 
    tplAssignUserModalTitle: TemplateRef<{}>,
    tplAssignUserModalContent: TemplateRef<{}>,
    tplAssignUserModalFooter: TemplateRef<{}>,
  ): void {
 
    this.currentWave = wave;
    this.currentPick = pick;

    this.listOfAllAssignableUsers = []; 

    this.selectedUserId = undefined;

    this.createQueryForm();

    // show the model
    this.queryUserModal = this.modalService.create({
      nzTitle: tplAssignUserModalTitle,
      nzContent: tplAssignUserModalContent,
      nzFooter: tplAssignUserModalFooter,

      nzWidth: 1000,
    });

  }
  createQueryForm(): void {
    // initiate the search form
    this.searchUserForm = this.fb.group({ 
      username: [null], 
      firstname: [null], 
      lastname: [null],
    });
 
  }
  
  assignUser(wave: Wave, pick: PickWork, userId?: number) {
    // console.log(`start to assign user with id ${userId}`);
    if (userId == null) {
    //  console.log(`no user is selected, do nothing`)
    }
    else {
      this.isSpinning = true;
      if (pick.pickGroupType == PickGroupType.BULK_PICK) {
        // console.log(`start to assign user to bulk pick`);
        this.bulkPickService.assignUser(pick.id, userId).subscribe({
          next: (bulkPick) => {
            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            // refresh the picked inventory
            this.search();  
          }, 
          error: () => this.isSpinning = false
        })
      }
      else if (pick.pickGroupType == null) {
        // console.log(`start to assign user to pick`);
        this.pickService.assignUser(pick.id, userId).subscribe({
          next: () => {
            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            // refresh the picked inventory
            this.search();  
          }, 
          error: () => this.isSpinning = false
        })
      }
    }
  }
  unassignUser(wave: Wave, pick: PickWork) { 
      this.isSpinning = true;
      if (pick.pickGroupType == PickGroupType.BULK_PICK) {
        // console.log(`start to unassign user to bulk pick`);
        this.bulkPickService.unassignUser(pick.id).subscribe({
          next: (bulkPick) => {
            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            // refresh the picked inventory
            this.search();  
          }, 
          error: () => this.isSpinning = false
        })
      }
      else if (pick.pickGroupType == null) {
        // console.log(`start to unassign user to pick`);
        this.pickService.unassignUser(pick.id).subscribe({
          next: () => {
            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            // refresh the picked inventory
            this.search();  
          }, 
          error: () => this.isSpinning = false
        })
      } 
  }
  
  unacknowledgeWorkTask(wave: Wave, workTaskId: number) {  
    this.isSpinning = true; 
    this.workTaskService.unacknowledgeWorkTask(workTaskId, false).subscribe({
      next: () => {
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        // refresh the picked inventory
        this.search();  
      }, 
      error: () => this.isSpinning = false
    }) ;
  }
  cancelPick(pick: PickWork, errorLocation: boolean, generateCycleCount: boolean): void {
    
    if (pick.pickGroupType == PickGroupType.LIST_PICK) {
      this.cancelPickList(pick, errorLocation, generateCycleCount);
    }
    else if (pick.pickGroupType == PickGroupType.BULK_PICK) {
      this.cancelBulkPick(pick, errorLocation, generateCycleCount);
    }
    else {
      
      this.cancelSinglePick(pick, errorLocation, generateCycleCount);
    }
  }
  cancelPickList(pick: PickWork, errorLocation: boolean, generateCycleCount: boolean): void { 
    this.isSpinning = true;
    this.pickListService.cancelPickList(pick.id, errorLocation, generateCycleCount).subscribe({
      next: () => {
        this.messageService.success(this.i18n.fanyi("message.action.success")); 
        this.isSpinning = false;
        this.search();
      }, 
      error: () => {                  
        this.messageService.error(this.i18n.fanyi("message.action.fail"));
        this.isSpinning = false;
      }
    });
  }
  cancelBulkPick(pick: PickWork, errorLocation: boolean, generateCycleCount: boolean): void { 
    this.isSpinning = true;
    this.bulkPickService.cancelBulkPick(pick.id, errorLocation, generateCycleCount).subscribe({
      next: () => {
        this.messageService.success(this.i18n.fanyi("message.action.success")); 
        this.isSpinning = false;
        this.search();
      }, 
      error: () => {                  
        this.messageService.error(this.i18n.fanyi("message.action.fail"));
        this.isSpinning = false;
      }
    });
  }
  cancelSinglePick(pick: PickWork, errorLocation: boolean, generateCycleCount: boolean): void { 
    this.isSpinning = true;
    this.pickService.cancelPick(pick, errorLocation, generateCycleCount).subscribe({
      next: () => {
        this.messageService.success(this.i18n.fanyi("message.action.success")); 
        this.isSpinning = false;
        this.search();
      }, 
      error: () => {                  
        this.messageService.error(this.i18n.fanyi("message.action.fail"));
        this.isSpinning = false;
      }
    });
  }

  printPickSheet(event: any, pickWork: PickWork) {

    if (pickWork.pickGroupType === PickGroupType.BULK_PICK) {
      
      this.printBulkPickSheet(event, pickWork);
    }
    else if (pickWork.pickGroupType === PickGroupType.SINGLE_PICK) {
      
      this.printSinglePickSheet(event, pickWork);
    }
    else if (pickWork.pickGroupType === PickGroupType.LIST_PICK) {
      
      this.printSinglePickSheet(event, pickWork);
    }
  }
  
  printBulkPickSheet(event: any, pickWork: PickWork) {

    this.isSpinning = true;
    this.bulkPickService.generateBulkPickSheet(
      pickWork.id)
      .subscribe({
        next: (printResult) => {  
          this.printingService.printFileByName(
            "Bulk Pick Sheet",
            printResult.fileName,
            ReportType.BULK_PICK_SHEET,
            event.printerIndex,
            event.printerName,
            event.physicalCopyCount,
            PrintPageOrientation.Portrait,
            PrintPageSize.Letter,
            pickWork.number, 
            printResult, event.collated);
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("report.print.printed"));
          }, 
        error:  () => this.isSpinning = false
      });   
    
  }
  
  printSinglePickSheet(event: any, pickWork: PickWork) {

    this.isSpinning = true;
    this.pickService.generatePickSheet(
      pickWork.id.toString())
      .subscribe({
        next: (printResult) => {  
          this.printingService.printFileByName(
            "Pick Sheet",
            printResult.fileName,
            ReportType.PICK_SHEET,
            event.printerIndex,
            event.printerName,
            event.physicalCopyCount,
            PrintPageOrientation.Portrait,
            PrintPageSize.Letter,
            pickWork.number, 
            printResult, event.collated);
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("report.print.printed"));
          }, 
        error:  () => this.isSpinning = false
      });   
    
  }
  printPickListSheet(event: any, pickWork: PickWork) {

    this.isSpinning = true;
    this.pickListService.generatePickListSheet(
      pickWork.id)
      .subscribe({
        next: (printResult) => {  
          this.printingService.printFileByName(
            "Pick List Sheet",
            printResult.fileName,
            ReportType.PICK_LIST_SHEET,
            event.printerIndex,
            event.printerName,
            event.physicalCopyCount,
            PrintPageOrientation.Portrait,
            PrintPageSize.Letter,
            pickWork.number, 
            printResult, event.collated);
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("report.print.printed"));
          }, 
        error:  () => this.isSpinning = false
      });   
    
  }

  previewPickSheet(waveNumber: string, pickWork: PickWork): void {

    if (pickWork.pickGroupType === PickGroupType.BULK_PICK) {
      
      this.previewBulkPickSheet(waveNumber, pickWork);
    }
    else if (pickWork.pickGroupType === PickGroupType.SINGLE_PICK) {
      
      this.previewSinglePickSheet(waveNumber, pickWork);
    }
    else if (pickWork.pickGroupType === PickGroupType.LIST_PICK) {
      
      this.previewPickListSheet(waveNumber, pickWork);
    }
  }

  previewBulkPickSheet(waveNumber: string, pickWork: PickWork): void {

    this.isSpinning = true;
    this.bulkPickService.generateBulkPickSheet(
      pickWork.id)
      .subscribe({
        next: (printResult) => {  
          this.isSpinning = false;
          sessionStorage.setItem('report_previous_page', `/outbound/wave?number=${waveNumber}`);
          this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.PORTRAIT}`);

        }, 
        error:  () => this.isSpinning = false
      });   
  }
  previewSinglePickSheet(waveNumber: string, pickWork: PickWork): void {

    this.isSpinning = true;
    this.pickService.generatePickSheet(
      pickWork.id.toString())
      .subscribe({
        next: (printResult) => {  
          this.isSpinning = false;
          sessionStorage.setItem('report_previous_page', `/outbound/wave?number=${waveNumber}`);
          this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.PORTRAIT}`);

        }, 
        error:  () => this.isSpinning = false
      });   
  }
  previewPickListSheet(waveNumber: string, pickWork: PickWork): void {

    this.isSpinning = true;
    this.pickListService.generatePickListSheet(
      pickWork.id)
      .subscribe({
        next: (printResult) => {  
          this.isSpinning = false;
          sessionStorage.setItem('report_previous_page', `/outbound/wave?number=${waveNumber}`);
          this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.PORTRAIT}`);

        }, 
        error:  () => this.isSpinning = false
      });   
  }
  
  getSelectedPicks(wave: Wave): PickWork[] {
    let selectedPicks: PickWork[] = [];
    
    const dataList: STData[] = this.stPick.list; 
    dataList
      .filter( data => data.checked)
      .forEach(
        data => {
          // get the selected billing request and added it to the 
          // selectedBillingRequests
          selectedPicks = [...selectedPicks,
              ...this.mapOfPicks[wave.id!].filter(
                pick => pick.number == data["number"]
              )
          ]

        }
      );
    return selectedPicks;
  }

  printPickSheetInBatch(event: any, wave: Wave) {

    let picks : PickWork[] = this.getSelectedPicks(wave);
    if (picks.length == 0) {
      return;
    }
    this.isSpinning = true;
    let count = 3;
    // group the picks according to the type
    const singlePickIds : string = 
        picks.filter(pick => pick.pickGroupType == PickGroupType.SINGLE_PICK)
        .map(pick => pick.id)
        .join(",");
    const listPickIds : string = 
        picks.filter(pick => pick.pickGroupType == PickGroupType.LIST_PICK)
          .map(pick => pick.id)
          .join(",");
    const bulkPickIds : string = 
        picks.filter(pick => pick.pickGroupType == PickGroupType.BULK_PICK)
          .map(pick => pick.id)
          .join(",");

    // LOOP through each group and print the report
    // we will generate and print the PDF file in batch  
    if (singlePickIds.length > 0) {

      this.pickService.generatePickSheet(
        singlePickIds)
        .subscribe({
          next: (printResult) => {  
            this.printingService.printFileByName(
              "Pick Sheet",
              printResult.fileName,
              ReportType.PICK_SHEET,
              event.printerIndex,
              event.printerName,
              event.physicalCopyCount,
              PrintPageOrientation.Portrait,
              PrintPageSize.Letter,
              singlePickIds, 
              printResult, event.collated);  

            count--;
            if (count <= 0) {
              this.isSpinning = false;
            }
          }, 
          error: () => this.isSpinning = false 
        });   
    }
    else {
      count--;
      if (count <= 0) {
        this.isSpinning = false;
      }
    }
    
    if (listPickIds.length > 0) {

        this.pickListService.generatePickListSheetInBatch(
          listPickIds)
          .subscribe({
            next: (printResults) => {    
              printResults.forEach(printResult => {
                this.printingService.printFileByName(
                  "List Pick Sheet",
                  printResult.fileName,
                  ReportType.PICK_LIST_SHEET,
                  event.printerIndex,
                  event.printerName,
                  event.physicalCopyCount,
                  PrintPageOrientation.Portrait,
                  PrintPageSize.Letter,
                  listPickIds, 
                  printResult, event.collated);  
                
              });
              count--;
              if (count <= 0) {
                this.isSpinning = false;
              }
              
            }, 
            error: () => this.isSpinning = false   
          });    
    }
    else {
      count--;
      if (count <= 0) {
        this.isSpinning = false;
      }
    }
    
    if (bulkPickIds.length > 0) {
  
        this.bulkPickService.generateBulkPickSheetInBatch(
          bulkPickIds)
          .subscribe({
            next: (printResults) => {    
              printResults.forEach(printResult => {
                
                this.printingService.printFileByName(
                  "Bulk Pick Sheet",
                  printResult.fileName,
                  ReportType.BULK_PICK_SHEET,
                  event.printerIndex,
                  event.printerName,
                  event.physicalCopyCount,
                  PrintPageOrientation.Portrait,
                  PrintPageSize.Letter,
                  bulkPickIds, 
                  printResult, event.collated);  
              });
              count--;
              if (count <= 0) {
                this.isSpinning = false;
              }
              
            }, 
            error: () => this.isSpinning = false 
          });    
    }
    else {
      count--;
      if (count <= 0) {
        this.isSpinning = false;
      }
    }
    
  }

  printWavePickSheet(event: any, wave: Wave) {

     
    this.isSpinning = true;
    this.waveService
      .generatePickSheet(wave.id!, this.i18n.currentLang)
      .subscribe(printResult => {

        // send the result to the printer
        this.printingService.printFileByName(
          "wave pick sheet",
          printResult.fileName,
          ReportType.WAVE_PICK_SHEET_BY_LOCATION,
          event.printerIndex,
          event.printerName,
          event.physicalCopyCount, PrintPageOrientation.Landscape,
          PrintPageSize.A4,
          wave.number,
          printResult, event.collated);
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("report.print.printed"));
      });
     
 
    
  }
  
  previewPickSheetInBatch(wave: Wave): void {
    let picks : PickWork[] = this.getSelectedPicks(wave);
    console.log(`get ${picks.length} selected picks from wave ${wave.number}`);
    if (picks.length == 0) {
      return;
    }
    this.isSpinning = true;
    let count = 3;
    // group the picks according to the type
    const singlePickIds : string = 
        picks.filter(pick => pick.pickGroupType == PickGroupType.SINGLE_PICK)
        .map(pick => pick.id)
        .join(",");
    const listPickIds : string = 
        picks.filter(pick => pick.pickGroupType == PickGroupType.LIST_PICK)
          .map(pick => pick.id)
          .join(",");
    const bulkPickIds : string = 
        picks.filter(pick => pick.pickGroupType == PickGroupType.BULK_PICK)
          .map(pick => pick.id)
          .join(",");
    
    console.log(`singlePickIds: ${singlePickIds}  `);
    console.log(`listPickIds: ${listPickIds}  `);
    console.log(`bulkPickIds: ${bulkPickIds}  `);
    sessionStorage.setItem('report_previous_page', ``);       
    // LOOP through each group and print the report
    // we will generate and print the PDF file in batch  
    if (singlePickIds.length > 0) {

      this.pickService.generatePickSheet(
        singlePickIds)
        .subscribe({
          next: (printResult) => {    
            count--;
            if (count <= 0) {
              this.isSpinning = false;
            }
            window.open(`/#/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.PORTRAIT}`, '_blank'); 
  
          }, 
          error: () => this.isSpinning = false  
        });    
    }
    else {
      count--;
      if (count <= 0) {
        this.isSpinning = false;
      }
    }
    if (listPickIds.length > 0) {

      this.pickListService.generatePickListSheetInBatch(
        listPickIds)
        .subscribe({
          next: (printResults) => {    
            count--;
            if (count <= 0) {
              this.isSpinning = false;
            }
            printResults.forEach(printResult => {
              window.open(`/#/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.PORTRAIT}`, '_blank'); 

            });
            
          },  
          error: () => this.isSpinning = false 
        });    
    }
    else {
      count--;
      if (count <= 0) {
        this.isSpinning = false;
      }
    }
    if (bulkPickIds.length > 0) {

      this.bulkPickService.generateBulkPickSheetInBatch(
        bulkPickIds)
        .subscribe({
          next: (printResults) => {    
            count--;
            if (count <= 0) {
              this.isSpinning = false;
            }
            printResults.forEach(printResult => {
              window.open(`/#/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.PORTRAIT}`, '_blank'); 

            });
            
          },  
          error: () => this.isSpinning = false 
        });    
    }
    else {
      count--;
      if (count <= 0) {
        this.isSpinning = false;
      }
    }

  }
  
  previewWavePickSheet( wave: Wave) {

     
    this.isSpinning = true;
    this.waveService
      .generatePickSheet(wave.id!, this.i18n.currentLang)
      .subscribe({
        next: (printResult)=> {
          // console.log(`Print success! result: ${JSON.stringify(printResult)}`);
          this.isSpinning = false;
          sessionStorage.setItem("report_previous_page", `outbound/wave?number=${wave.number}`);
          
          this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.LANDSCAPE}`);
    
        }, 
        error: () => this.isSpinning = false
      }); 
     
 
    
  }
  confirmPicks(wave: Wave): void {
    this.router.navigateByUrl(`/outbound/pick/confirm?type=wave&id=${wave.id}`);
  }
  cancelSelectedPick(wave: Wave, errorLocation: boolean, generateCycleCount: boolean): void {
    this.isSpinning = true;
    const picks :PickWork[] = [];
    this.getSelectedPicks(wave).filter(
      pick => this.readyForCancelPick(pick)
    ).forEach(pick => { 
        picks.push(pick);
    });
 
    if (picks.length ===0) {
        this.messageService.success(this.i18n.fanyi("message.action.success"));
        this.isSpinning = false;
        return;
    }
    
    // split picks based on the type
    const bulkPicks :PickWork[] = [];
    const pickLists :PickWork[] = [];
    const singlePicks :PickWork[] = [];

      picks.forEach(
        pick => {
          if (pick.pickGroupType === PickGroupType.BULK_PICK) {
            bulkPicks.push(pick);
          }
          else if (pick.pickGroupType === PickGroupType.LIST_PICK) {
            pickLists.push(pick);
          }
          else {
            singlePicks.push(pick);
          }
        }
      )

      this.pickService.cancelPicks(singlePicks, errorLocation, generateCycleCount).subscribe({
        next: () => { 
          this.bulkPickService.cancelBulkPickInBatch(bulkPicks, errorLocation, generateCycleCount).subscribe({
            next: () => {              
              this.pickListService.cancelPickListInBatch(pickLists, errorLocation, generateCycleCount).subscribe({
                next: () => {
                  this.messageService.success(this.i18n.fanyi("message.action.success")); 
                  this.isSpinning = false;
                  this.search();
                }, 
                error: () => {                  
                  this.messageService.error(this.i18n.fanyi("message.action.fail"));
                  this.isSpinning = false;
                }
              }); 
            }, 
            error: () => {
              
              this.messageService.error(this.i18n.fanyi("message.action.fail"));
              this.isSpinning = false;
            }
          }) ;
        }, 
        error: () => {
          
          this.messageService.error(this.i18n.fanyi("message.action.fail"));
          this.isSpinning = false;
        }
      }) 
  }
  
  closeUserQueryModal(): void {
    this.queryUserModal.destroy();
  }
  returnUserResult(): void {
    // get the selected record
    if (this.isAnyUserRecordChecked()) {
      this.assignUser(this.currentWave!, this.currentPick!, this.selectedUserId);
    } else {
      console.log(`no user is selected, do nothing`)
    }
    this.queryUserModal.destroy();

  } 
  isAnyUserRecordChecked() {
    return  this.selectedUserId != undefined;;
  }
  searchUser(): void {
    this.searching = true;
    this.selectedUserId = undefined;
    if (this.currentPick?.workTaskId == null) {
      // if we can't get the current work task 
      // return an empty user result set
      this.listOfAllAssignableUsers = [];
      return;
    }
    this.userService
      .getUsers( 
        this.searchForm.value.username, 
        undefined,
        undefined,
        this.searchForm.value.firstname,
        this.searchForm.value.lastname,
        this.currentPick.workTaskId
      )
      .subscribe({
        next: (userRes) => {

          this.listOfAllAssignableUsers = userRes; 

          this.searching = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: userRes.length,
          });
        }, 
        error: () => {
          this.searching = false;
          this.searchResult = '';
        },
      });
  } 
  userTablechanged(ret: STChange): void {
    // console.log('change', ret);
    if (ret.type == 'radio') {
      this.selectedUserId = undefined;
      if (ret.radio != null && ret.radio!.id != null) {
        // console.log(`chosen user ${ret.radio!.id} / ${ret.radio!.username}`);
        this.selectedUserId = ret.radio!.id;
      }
    }
  }

  // the pick is ready for cancellation only if
  // 1. for a single pick, if the pick is not fully picked
  // 2. for a list pick, if there's nothing picked yet
  readyForCancelPick(pick: PickWork): boolean {
    if (pick.pickGroupType == null ||
        pick.pickGroupType == PickGroupType.SINGLE_PICK) {
      return pick.pickedQuantity < pick.quantity;
    }
    if (pick.pickGroupType == PickGroupType.LIST_PICK) {
      return pick.pickedQuantity == 0;
    }

    return true;
  }

}
