import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core'; 
import { STChange, STColumn, STComponent } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, User, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { Inventory } from '../../inventory/models/inventory';
import { InventoryService } from '../../inventory/services/inventory.service';
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
import { BulkPickService } from '../services/bulk-pick.service';
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

  pickTableExpandSet = new Set<number>();
  pickStatuses = PickStatus;
  currentWave?: Wave;
  currentPick?: PickWork;
  
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
  ) { 
    userService.isCurrentPageDisplayOnly("/outbound/wave").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                              
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
        console.log(`start to setup ${pickRes.length}`);
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
      console.log(`start to setup work task for bulk pick`); 
    }
    else if (pick.pickGroupType == null) {
      
    }
    
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
  isWaveAllocatable(wave: Wave): boolean {
    return wave.totalOpenQuantity! > 0;
  }

  cancelPick(wave: Wave, pick: PickWork, errorLocation: boolean, generateCycleCount: boolean): void {
    
    this.isSpinning = true;
    if (pick.pickGroupType == PickGroupType.BULK_PICK) {
      console.log(`start to assign user to bulk pick`);
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
    console.log(`start to release pick \n ${JSON.stringify(pick)}`);

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
    console.log(`start to assign user with id ${userId}`);
    if (userId == null) {
      console.log(`no user is selected, do nothing`)
    }
    else {
      this.isSpinning = true;
      if (pick.pickGroupType == PickGroupType.BULK_PICK) {
        console.log(`start to assign user to bulk pick`);
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
        console.log(`start to assign user to pick`);
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
        console.log(`start to unassign user to bulk pick`);
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
        console.log(`start to unassign user to pick`);
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
}
