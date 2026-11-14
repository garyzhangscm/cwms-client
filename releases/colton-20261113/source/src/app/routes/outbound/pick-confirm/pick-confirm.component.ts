import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { InventoryConfiguration } from '../../inventory/models/inventory-configuration';
import { InventoryConfigurationService } from '../../inventory/services/inventory-configuration.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { WorkOrder } from '../../work-order/models/work-order';
import { WorkOrderService } from '../../work-order/services/work-order.service';
import { Cartonization } from '../models/cartonization';
import { Order } from '../models/order';
import { PickGroupType } from '../models/pick-group-type.enum';
import { PickList } from '../models/pick-list';
import { PickStatus } from '../models/pick-status.enum';
import { PickWork } from '../models/pick-work';
import { Shipment } from '../models/shipment';
import { Wave } from '../models/wave';
import { CartonizationService } from '../services/cartonization.service';
import { OrderService } from '../services/order.service';
import { PickListService } from '../services/pick-list.service';
import { PickService } from '../services/pick.service';
import { ShipmentService } from '../services/shipment.service';
import { WaveService } from '../services/wave.service';

@Component({
    selector: 'app-outbound-pick-confirm',
    templateUrl: './pick-confirm.component.html',
    styleUrls: ['./pick-confirm.component.less'],
    standalone: false
})
export class OutboundPickConfirmComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  isSpinning = false;
  listOfColumns: Array<ColumnItem<PickWork>> = [
    {
      name: 'pick.number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: PickWork, b: PickWork) => this.utilService.compareNullableString(a.number, b.number),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'type',
      showSort: true,
      sortOrder: null,
      sortFn: (a: PickWork, b: PickWork) => this.utilService.compareNullableString(a.pickGroupType, b.pickGroupType),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, 
    {
      name: 'status',
      showSort: true,
      sortOrder: null,
      sortFn: (a: PickWork, b: PickWork) => this.utilService.compareNullableString(a.status, b.status),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },{
      name: 'sourceLocation',
      showSort: true,
      sortOrder: null,
      sortFn: (a: PickWork, b: PickWork) => this.utilService.compareNullableObjField(a.sourceLocation, b.sourceLocation, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'destinationLocation',
      showSort: true,
      sortOrder: null,
      sortFn: (a: PickWork, b: PickWork) => this.utilService.compareNullableObjField(a.destinationLocation, b.destinationLocation, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'item',
      showSort: true,
      sortOrder: null,
      sortFn: (a: PickWork, b: PickWork) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'item.description',
      showSort: true,
      sortOrder: null,
      sortFn: (a: PickWork, b: PickWork) => this.utilService.compareNullableObjField(a.item, b.item, 'description'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'pick.quantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: PickWork, b: PickWork) => this.utilService.compareNullableNumber(a.quantity, b.quantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'pick.pickedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: PickWork, b: PickWork) => this.utilService.compareNullableNumber(a.pickedQuantity, b.pickedQuantity),
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
  pickStatus = PickStatus;
  pickGroupTypes = PickGroupType;


  pageTitle = '';
  lastPageUrl = '';
  type = 'NONE';
  id = '';

  inventoryConfiguration?: InventoryConfiguration;
  
  workOrder!: WorkOrder;
  order!: Order;
  shipment!: Shipment;
  wave!: Wave;
  pickList!: PickList;
  cartonization!: Cartonization;
  confirming = false;
  totalPickCountToConfirm = 0;

  // Table data for display
  listOfAllPicks: PickWork[] = [];
  listOfDisplayPicks: PickWork[] = [];


  // If all picks displayed are fully confirmed
  // we will disable the cancel button, confirm button
  // and the "check all" check box
  allPicksFullyConfirmed = false;

  mapOfConfirmedQuantity: { [key: string]: number } = {};

  queryForm!: UntypedFormGroup;
  searching = false;
  containerId = '';

  displayOnly = false;
  constructor(
    private activatedRoute: ActivatedRoute, 
    private titleService: TitleService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private workOrderService: WorkOrderService,
    private orderService: OrderService,
    private shipmentService: ShipmentService,
    private pickService: PickService,
    private pickListService: PickListService,
    private waveService: WaveService,
    private userService: UserService,
    private cartonizationService: CartonizationService,
    private router: Router,
    private fb: UntypedFormBuilder,
    private utilService: UtilService,
    private inventoryConfigurationService: InventoryConfigurationService,
  ) {
    userService.isCurrentPageDisplayOnly("/outbound/pick/confirm").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                            
    this.pageTitle = this.i18n.fanyi('page.outbound.pick-confirm.title');
    
    inventoryConfigurationService.getInventoryConfigurations().subscribe({
      next: (inventoryConfigurationRes) => {
        if (inventoryConfigurationRes) { 
          this.inventoryConfiguration = inventoryConfigurationRes;
        }  
      } ,
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.outbound.pick-confirm.title'));

    // check if we are confirming picks for
    // 1. outbound order
    // 2. pick list
    // 3. work order
    // For any single pick, it can be confirmed in the correpondent pages
    // 1. order display
    // 2. work order display
    // 3. pick list display
    // 4. replenishment display
    this.activatedRoute.queryParams.subscribe(params => {
      this.type = params['type'] ? params['type'] : '';

      if (params['id']) {
        this.id = params['id'];
      }
      this.displayInformation();
    });
  }

  displayInformation(refresh: boolean = false): void {
    switch (this.type) {
      case 'workOrder':
        this.displayWorkOrder(+this.id);
        break;
      case 'order':
        this.displayOrder(+this.id);
        break;
      case 'shipment':
        this.displayShipment(+this.id);
        break;
      case 'picks':
        this.displayPicks(this.id);
        break;
      case 'pickList':
        this.displayPickList(+this.id);
        break;
      case 'wave':
        this.displayWave(+this.id);
        break;
      case 'cartonization':
        this.displayCartonization(+this.id);
        break;
      default:
        this.displayBlankQueryForm(refresh);
        break;
    }
  }
  // Show query form to accept user input with
  // carton number or pick list number to begin
  // pick confirmation
  // Refresh mode: Everytime we finish a pick,
  // we will refresh
  displayBlankQueryForm(refresh: boolean): void {
    if (refresh) {
      // in refresh mode, we will query again
      // with the same criteria
      this.searchPicks();
    } else {
      this.queryForm = this.fb.group({
        containerId: ['', Validators.required],
        pickToContainerFlag: [true],
      });
    }
  }
  searchPicks(): void {
    if (this.queryForm.valid) {
      this.containerId = this.queryForm.value.containerId;
      this.searchPicksByContainer(this.queryForm.value.containerId);
    } else {
      this.displayFormError(this.queryForm);
    }
  }
  displayFormError(fromGroup: UntypedFormGroup): void {
    // tslint:disable-next-line: forin
    for (const i in fromGroup.controls) {
      fromGroup.controls[i].markAsDirty();
      fromGroup.controls[i].updateValueAndValidity();
    }
  }

  // We allow the user to scan one of the following id
  // 1. Pick work's number
  // 2. Order Number: TO-DO
  // 3. Shipment Number: TO-DO
  // 4. Work Order Number: TO-DO
  // 5. List Pick Number
  // 6. Carton Number
  searchPicksByContainer(containerId: string): void {
    this.pickService.getPicksByContainerId(containerId).subscribe(pickRes => {
      if (pickRes.length > 0) {
        this.listOfAllPicks = pickRes;
        this.listOfDisplayPicks = pickRes;
        this.setupConfirmedQuantity(this.listOfAllPicks);
        this.refreshCheckedStatus(true);
      } else {
        // Show error
      }
    });
  }
  displayPicks(pickIds: string): void {
    console.log(`we will display picks by id list: ${pickIds}`);

    this.lastPageUrl = `/outbound/picks?ids=${pickIds}`;
    // initial the picks array;
    this.pickService.getPicksByIds(pickIds).subscribe(pickRes => {
      this.listOfAllPicks = pickRes;
      this.listOfDisplayPicks = pickRes;
      this.setupConfirmedQuantity(this.listOfAllPicks);
      this.refreshCheckedStatus();
    });
  }
  displayWorkOrder(workOrderId: number): void {
    // Let's get the work order by number
    this.workOrderService.getWorkOrder(workOrderId).subscribe(workOrderRes => {
      this.workOrder = workOrderRes;
      this.lastPageUrl = `/work-order/work-order?number=${this.workOrder.number}`;

      // initial the picks array;
      this.listOfAllPicks = [];

      this.pickService.getPicksByWorkOrder(this.workOrder).subscribe(
        {
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
                  
                  this.listOfAllPicks = pickWorks;
                  this.listOfDisplayPicks = pickWorks;
                  this.setupConfirmedQuantity(this.listOfAllPicks);
                  this.refreshCheckedStatus(); 

                  // setup the work task related information
                  // this.setupWorkTaskInformationForPicks(this.mapOfPicks[wave.id!]);
                }
            );
          }
        }
      );
    });
  }
  displayOrder(orderId: number): void {
    // Let's get the work order by number
    this.orderService.getOrder(orderId).subscribe(orderRes => {
      this.order = orderRes;
      this.lastPageUrl = `/outbound/order?number=${this.order.number}`;
      // initial the picks array;
      this.pickService.getPicksByOrder(this.order.id!).subscribe({
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
                  
                  this.listOfAllPicks = pickWorks;
                  this.listOfDisplayPicks = pickWorks;
                  this.setupConfirmedQuantity(this.listOfAllPicks);
                  this.refreshCheckedStatus(); 

                  // setup the work task related information
                  // this.setupWorkTaskInformationForPicks(this.mapOfPicks[wave.id!]);
                }
            );
        }
      });
    });
  }
  displayShipment(shipmentId: number): void {
    // Let's get the work order by number
    this.shipmentService.getShipment(shipmentId).subscribe(shipmentRes => {
      this.shipment = shipmentRes;
      this.lastPageUrl = `/outbound/shipment?number=${this.shipment.number}`;
      // initial the picks array;
      this.pickService.getPicksByShipment(this.shipment.id).subscribe({
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
                  
                  this.listOfAllPicks = pickWorks;
                  this.listOfDisplayPicks = pickWorks;
                  this.setupConfirmedQuantity(this.listOfAllPicks);
                  this.refreshCheckedStatus(); 

                  // setup the work task related information
                  // this.setupWorkTaskInformationForPicks(this.mapOfPicks[wave.id!]);
                }
            );
        }
      });
    });
  }
  displayWave(waveId: number): void {
    // Let's get the work order by number
    this.waveService.getWave(waveId).subscribe(waveRes => {
      this.wave = waveRes;
      this.lastPageUrl = `/outbound/wave?number=${this.wave.number}`;
      // initial the picks array;
      this.pickService.getPicksByWave(this.wave.id!).subscribe({
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
                    
                    this.listOfAllPicks = pickWorks;
                    this.listOfDisplayPicks = pickWorks;
                    this.setupConfirmedQuantity(this.listOfAllPicks);
                    this.refreshCheckedStatus(); 

                    // setup the work task related information
                    // this.setupWorkTaskInformationForPicks(this.mapOfPicks[wave.id!]);
                  }
              );

                
          }

      }); 
    });
  }
  displayPickList(pickListId: number): void {
    // Let's get the work order by number
    this.pickListService.getPickList(pickListId).subscribe(pickListRes => {
      this.pickList = pickListRes;
      this.lastPageUrl = `/outbound/pick-list?number=${this.pickList.number}`;
      // initial the picks array;
      this.pickService.getPicksByPickList(this.pickList.id).subscribe({
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
                  
                  this.listOfAllPicks = pickWorks;
                  this.listOfDisplayPicks = pickWorks;
                  this.setupConfirmedQuantity(this.listOfAllPicks);
                  this.refreshCheckedStatus(); 

                  // setup the work task related information
                  // this.setupWorkTaskInformationForPicks(this.mapOfPicks[wave.id!]);
                }
            );
        }
      });
    });
  }
  displayCartonization(cartonizationId: number): void {
    // Let's get the work order by number
    this.cartonizationService.get(cartonizationId).subscribe(cartonizationRes => {
      this.cartonization = cartonizationRes;
      this.lastPageUrl = `/outbound/cartonization?number=${this.cartonization.number}`;
      // initial the picks array;
      this.pickService.getPicksByCartonization(this.cartonization.id).subscribe({
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
                  
                  this.listOfAllPicks = pickWorks;
                  this.listOfDisplayPicks = pickWorks;
                  this.setupConfirmedQuantity(this.listOfAllPicks);
                  this.refreshCheckedStatus(); 

                  // setup the work task related information
                  // this.setupWorkTaskInformationForPicks(this.mapOfPicks[wave.id!]);
                }
            );
        }
      });
    });
  }

  setupConfirmedQuantity(picks: PickWork[]): void {
    picks.forEach(pick => {
      // the user is only allow to confirm single pick in this page
      if (pick.pickGroupType == null || pick.pickGroupType === PickGroupType.SINGLE_PICK) {

        this.mapOfConfirmedQuantity[pick.number] = pick.quantity - pick.pickedQuantity;
      }
      else {
        
        this.mapOfConfirmedQuantity[pick.number] = 0;
      }
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
    this.listOfDisplayPicks!.forEach(pick => {
      if ((pick.pickGroupType == null || pick.pickGroupType === PickGroupType.SINGLE_PICK) &&
          pick.quantity > pick.pickedQuantity && pick.status == PickStatus.RELEASED) {

        this.updateCheckedSet(pick.id, value);
      }
      else {
        this.updateCheckedSet(pick.id, false);
      }  
    });
    this.refreshCheckedStatus();
  }

  currentPageDataChange($event: PickWork[]): void {
    this.listOfDisplayPicks! = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(checkAll?: boolean): void {
    if (checkAll) {
      this.listOfDisplayPicks.every(item => (this.setOfCheckedId.add(item.id)));
    }

    this.checked = this.listOfDisplayPicks!.every(item => this.setOfCheckedId.has(item.id));
    this.indeterminate = this.listOfDisplayPicks!.some(item => this.setOfCheckedId.has(item.id)) && !this.checked;
  }


  cancelSelectedPicks(errorLocation: boolean, generateCycleCount: boolean): void {
    // make sure we have at least one checkbox checked
    const selectedPicks = this.getSelectedPicks();
    if (selectedPicks.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkDanger: true,
        nzOnOk: () => {
          this.pickService.cancelPicks(selectedPicks, errorLocation, generateCycleCount).subscribe(res => {
            this.message.success(this.i18n.fanyi('message.pick.cancelled'));
            this.displayInformation();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
      });
    }
  }

  confirmPicks(): void {
    // make sure we have at least one checkbox checked
    const selectedPicks = this.getSelectedPicks().filter(
      pick => pick.status == PickStatus.RELEASED
    );
    if (selectedPicks.length > 0) {
      this.isSpinning = true;
      this.totalPickCountToConfirm = selectedPicks.length;

      // we will separate the picks into groups based on the
      // item and source location. We will add picks from
      // same source location / item into a queue so it will be 
      // confirmed one by one to avoid concurrency problem

      let pickToContainer = false;
      if (this.queryForm) {
        pickToContainer = this.queryForm.value.pickToContainerFlag;
      }
      let pickMap = new Map();
      
      selectedPicks.forEach(pick => {
        let key = `${pick.sourceLocationId}-${pick.itemId}`;
        let pickList: PickWork[] = [];
        if (pickMap.has(key)) {
          pickList = pickMap.get(key);
        }
        pickList = [...pickList, pick];
        pickMap.set(key, pickList);
      })
      console.log(`pickMap.size: ${pickMap.size}`);

      for (let [key, value] of pickMap) {
        let pickList: PickWork[] = value;
        console.log(`process pickMap with key: ${key}, pickList's size is ${pickList.length}`);
        this.confirmPickListByIndex(pickList, 0, pickToContainer, this.containerId);

      } 

      /***
       * 
       * 
      selectedPicks.forEach(pick => {
        this.pickService
          .confirmPick(pick, this.mapOfConfirmedQuantity[pick.number], pickToContainer, this.containerId)
          .subscribe(pickRes => {
            this.message.success(this.i18n.fanyi('message.action.success'));
            this.totalPickCountToConfirm--;
            if (this.totalPickCountToConfirm === 0) {
              this.displayInformation(true);
              this.isSpinning = false;
            }
          }, 
          () => this.isSpinning = false);
      });
       * 
       */
    }
  }

  confirmPickListByIndex(pickList: PickWork[], index: number, pickToContainer: boolean, containerId: string) {

    // make sure the index is still within the list
    if (index < pickList.length) {
      this.pickService
          .confirmPick(pickList[index], this.mapOfConfirmedQuantity[pickList[index].number], pickToContainer, containerId)
          .subscribe(pickRes => {
            // confirm next pick in the list
            
            this.message.success(`${pickRes.number}: ${this.i18n.fanyi('message.action.success')}`);
            this.totalPickCountToConfirm--;
            if (this.totalPickCountToConfirm === 0) {
              this.displayInformation(true);
              this.isSpinning = false;
            }
            this.confirmPickListByIndex(pickList, index + 1, pickToContainer, containerId);
          }, 
          () => this.isSpinning = false);
    }
  }
  getSelectedPicks(): PickWork[] {
    const selectedPicks: PickWork[] = [];
    this.listOfAllPicks.forEach((pick: PickWork) => {
      if (this.setOfCheckedId.has(pick.id) && pick.quantity > pick.pickedQuantity) {
        selectedPicks.push(pick);
      }
    });
    return selectedPicks;
  }

  confirmPick(pick: PickWork): void {
    this.confirming = true;
    this.isSpinning = true;

    let pickToContainer = false;
    if (this.queryForm) {
      pickToContainer = this.queryForm.value.pickToContainerFlag;
    }
    this.pickService
      .confirmPick(pick, this.mapOfConfirmedQuantity[pick.number], pickToContainer, this.containerId)
      .subscribe(
        {
          next: () => {

            this.message.success(this.i18n.fanyi('message.action.success'));
            this.displayInformation(true);
            this.confirming = false;
            this.isSpinning = false;
          }, 
          error: () => {
            
            this.confirming = false;
            this.isSpinning = false;
          }
        });
  }
  returnToPreviousPage(): void {
    this.router.navigateByUrl(this.lastPageUrl);
  }
}
