import { formatDate } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder,  UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { ColumnItem } from '../../util/models/column-item';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { UtilService } from '../../util/services/util.service';
import { WorkOrderService } from '../../work-order/services/work-order.service';
import { PickWork } from '../models/pick-work';
import { PickService } from '../services/pick.service';

@Component({
    selector: 'app-outbound-pick',
    templateUrl: './pick.component.html',
    styleUrls: ['./pick.component.less'],
    standalone: false
})
export class OutboundPickComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
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
    }, {
      name: 'pick.type',
      showSort: true,
      sortOrder: null,
      sortFn: (a: PickWork, b: PickWork) => this.utilService.compareNullableString(a.pickType, b.pickType),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'order.number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: PickWork, b: PickWork) => this.utilService.compareNullableString(a.orderNumber, b.orderNumber),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },  {
      name: 'work-order.number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: PickWork, b: PickWork) => this.utilService.compareNullableString(a.workOrderNumber, b.workOrderNumber),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
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
  isSpinning = false;
  loadingPickWorkDetailsRequest = 0;
  // work order number map to cache the work order
  // key: work order line id
  // value: work order number
  workOrderNumberMap: Map<number, string> = new Map()

  // local cache for performance purpose only
  loadingWorkOrderLineInProcess: Set<number> = new Set();

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder, 
    private modalService: NzModalService,
    private pickService: PickService,
    private message: NzMessageService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private router: Router,
    private utilService: UtilService,
    private localCacheService: LocalCacheService,
    private userService: UserService,
    private workOrderService: WorkOrderService,
  ) {
    userService.isCurrentPageDisplayOnly("/outbound/pick").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                           
   }

  // Form related data and functions
  searchForm!: UntypedFormGroup;
  

  // Table data for display
  listOfAllPicks: PickWork[] = [];
  listOfDisplayPicks: PickWork[] = [];

  searching = false;
  searchResult = '';


  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllPicks = [];
    this.listOfDisplayPicks = [];
  }

  search(shortAllocationId?: number): void {
    this.searching = true;
    this.isSpinning = true;
    this.searchResult = '';

    this.pickService
      .queryPicks(
        this.searchForm.value.number,
        this.searchForm.value.orderNumber,
        this.searchForm.value.itemNumber,
        this.searchForm.value.sourceLocation,
        this.searchForm.value.destinationLocation,
        shortAllocationId,
        this.searchForm.value.openPickOnly,
        false
      )
      .subscribe(
        pickRes => {
          this.listOfAllPicks = pickRes;
          this.listOfDisplayPicks = pickRes;

          this.searching = false;
          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: pickRes.length,
          });

          // load the information
          this.refreshDetailInformations(this.listOfAllPicks);
        },
        () => {
          this.searching = false;
          this.isSpinning = false;
          this.searchResult = '';
        },
      );
  }
  
  // we will load the client / supplier / item information 
  // asyncronized
  async refreshDetailInformations(picks: PickWork[]) {  
    // const currentPageOrders = this.getCurrentPageOrders(); 
    let index = 0;
    this.loadingPickWorkDetailsRequest = 0;
    while (index < picks.length) {

      // we will need to make sure we are at max loading detail information
      // for 10 orders at a time(each order may have 5 different request). 
      // we will get error if we flush requests for
      // too many orders into the server at a time
      // console.log(`1. this.loadingOrderDetailsRequest: ${this.loadingOrderDetailsRequest}`);
      
      
      while(this.loadingPickWorkDetailsRequest > 50) {
        // sleep 50ms        
        await this.delay(50);
      } 
      
      this.refreshDetailInformation(picks[index]);
      index++;
    } 
    
  }
  
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
  
  
  refreshDetailInformation(pick: PickWork) {
   
    this.loadWorkOrder(pick);
    this.loadItem(pick); 
   
    this.loadLocation(pick); 
 
  }
  async loadWorkOrder(pick:PickWork) {
    if (pick.workOrderNumber == null && pick.workOrderLineId) {
      // the work order line is in another request, let's 
      // wait until it is done in the other request so we can 
      // get from the cache. We don't have to make the same http request
      // if multiple picks have the same work order line id
       while (this.loadingWorkOrderLineInProcess.has(pick.workOrderLineId)) {
        await this.delay(50); 
      }
      this.loadingWorkOrderLineInProcess.add(pick.workOrderLineId);
      if (this.workOrderNumberMap.has(pick.workOrderLineId)) {
        pick.workOrderNumber = this.workOrderNumberMap.get(pick.workOrderLineId)!;
        this.loadingWorkOrderLineInProcess.delete(pick.workOrderLineId);
             
      }
      else {

        this.loadingPickWorkDetailsRequest++;
        this.workOrderService.getWorkOrderLine(pick.workOrderLineId!).subscribe({
          next: (workOrderLineRes) => {
            pick.workOrderNumber = workOrderLineRes.workOrderNumber
            if (pick.workOrderNumber) {

              this.workOrderNumberMap.set(pick.workOrderLineId!, pick.workOrderNumber!);
              this.loadingWorkOrderLineInProcess.delete(pick.workOrderLineId!)
              
            }
            this.loadingPickWorkDetailsRequest--;
          }, 
          error: () => {
            this.loadingWorkOrderLineInProcess.delete(pick.workOrderLineId!)
           
            this.loadingPickWorkDetailsRequest--;

          }
        })
      }
    }
  }
  loadItem(pick:PickWork) {
    if (pick.item == null && pick.itemId) {
      this.loadingPickWorkDetailsRequest++;
      this.localCacheService.getItem(pick.itemId!).subscribe({
        next: (itemRes) => {
          pick.item = itemRes
          this.loadingPickWorkDetailsRequest--;
        }
      })
    }
  }
  loadLocation(pick:PickWork) {
    if (pick.sourceLocation == null && pick.sourceLocationId) {
      this.loadingPickWorkDetailsRequest++;
      this.localCacheService.getLocation(pick.sourceLocationId!).subscribe({
        next: (locationRes) => {
          pick.sourceLocation = locationRes
          this.loadingPickWorkDetailsRequest--;
        }
      })
    }
    if (pick.destinationLocation == null && pick.destinationLocationId) {
      this.loadingPickWorkDetailsRequest++;
      this.localCacheService.getLocation(pick.destinationLocationId!).subscribe({
        next: (locationRes) => {
          pick.destinationLocation = locationRes
          this.loadingPickWorkDetailsRequest--;
        }
      })
    }
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
    this.listOfDisplayPicks!.forEach(item => this.updateCheckedSet(item.id, value));
    this.refreshCheckedStatus();
  }

  currentPageDataChange($event: PickWork[]): void {
    this.listOfDisplayPicks! = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfDisplayPicks!.every(item => this.setOfCheckedId.has(item.id));
    this.indeterminate = this.listOfDisplayPicks!.some(item => this.setOfCheckedId.has(item.id)) && !this.checked;
  }


  cancelSelectedPicks(  
    errorLocation: boolean, generateCycleCount: boolean): void {
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
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  confirmSelectedPicks(): void {
    // make sure we have at least one checkbox checked
    const selectedPicks = this.getSelectedPicks();
    if (selectedPicks.length > 0) {
      const selectedPickList = selectedPicks.map(pick => pick.id).join(',');
      console.log(`selectedPickList: ${selectedPickList}`);
      this.router.navigateByUrl(`/outbound/pick/confirm?type=picks&id=${selectedPickList}`);
    }
  }
  getSelectedPicks(): PickWork[] {
    const selectedPicks: PickWork[] = [];
    this.listOfAllPicks.forEach((pick: PickWork) => {
      if (this.setOfCheckedId.has(pick.id)) {
        selectedPicks.push(pick);
      }
    });
    return selectedPicks;
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.pick'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      orderNumber: [null],
      itemNumber: [null],
      sourceLocation: [null],
      destinationLocation: [null],
      openPickOnly: [null],
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['shortAllocationId']) {
        this.search(params['shortAllocationId']);
      }
    });
  }
}
