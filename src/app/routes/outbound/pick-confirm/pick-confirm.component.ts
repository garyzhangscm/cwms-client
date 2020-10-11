import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { WorkOrder } from '../../work-order/models/work-order';
import { WorkOrderService } from '../../work-order/services/work-order.service';
import { Cartonization } from '../models/cartonization';
import { Order } from '../models/order';
import { PickList } from '../models/pick-list';
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
})
export class OutboundPickConfirmComponent implements OnInit {
  pageTitle = '';
  lastPageUrl = '';
  type = 'NONE';
  id = '';

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
  // confirmed quantity for each picks

  // If all picks displayed are fully confirmed
  // we will disable the cancel button, confirm button
  // and the "check all" check box
  allPicksFullyConfirmed = false;

  mapOfConfirmedQuantity: { [key: string]: number } = {};

  queryForm!: FormGroup;
  searching = false;
  containerId = '';
  
  constructor(
    private activatedRoute: ActivatedRoute,
    private i18n: I18NService,
    private titleService: TitleService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private workOrderService: WorkOrderService,
    private orderService: OrderService,
    private shipmentService: ShipmentService,
    private pickService: PickService,
    private pickListService: PickListService,
    private waveService: WaveService,
    private cartonizationService: CartonizationService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.pageTitle = this.i18n.fanyi('page.outbound.pick-confirm.title');
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
      this.type = params.type ? params.type : '';

      if (params.id) {
        this.id = params.id;
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
      this.containerId = this.queryForm.controls.containerId.value;
      this.searchPicksByContainer(this.queryForm.controls.containerId.value);
    } else {
      this.displayFormError(this.queryForm);
    }
  }
  displayFormError(fromGroup: FormGroup): void {
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
        this.refreshStatus(true);
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
      this.refreshStatus();
    });
  }
  displayWorkOrder(workOrderId: number): void {
    // Let's get the work order by number
    this.workOrderService.getWorkOrder(workOrderId).subscribe(workOrderRes => {
      this.workOrder = workOrderRes;
      this.lastPageUrl = `/work-order/work-order?number=${this.workOrder.number}`;

      // initial the picks array;
      this.listOfAllPicks = [];

      this.pickService.getPicksByWorkOrder(this.workOrder).subscribe(pickRes => {
        this.listOfAllPicks = pickRes;
        this.listOfDisplayPicks = pickRes;
        this.setupConfirmedQuantity(this.listOfAllPicks);
        this.refreshStatus();
      });
    });
  }
  displayOrder(orderId: number): void {
    // Let's get the work order by number
    this.orderService.getOrder(orderId).subscribe(orderRes => {
      this.order = orderRes;
      this.lastPageUrl = `/outbound/order?number=${this.order.number}`;
      // initial the picks array;
      this.pickService.getPicksByOrder(this.order.id).subscribe(pickRes => {
        this.listOfAllPicks = pickRes;
        this.listOfDisplayPicks = pickRes;
        this.setupConfirmedQuantity(this.listOfAllPicks);
        this.refreshStatus();
      });
    });
  }
  displayShipment(shipmentId: number): void {
    // Let's get the work order by number
    this.shipmentService.getShipment(shipmentId).subscribe(shipmentRes => {
      this.shipment = shipmentRes;
      this.lastPageUrl = `/outbound/shipment?number=${this.shipment.number}`;
      // initial the picks array;
      this.pickService.getPicksByShipment(this.shipment.id).subscribe(pickRes => {
        this.listOfAllPicks = pickRes;
        this.listOfDisplayPicks = pickRes;
        this.setupConfirmedQuantity(this.listOfAllPicks);
        this.refreshStatus();
      });
    });
  }
  displayWave(waveId: number): void {
    // Let's get the work order by number
    this.waveService.getWave(waveId).subscribe(waveRes => {
      this.wave = waveRes;
      this.lastPageUrl = `/outbound/wave?number=${this.wave.number}`;
      // initial the picks array;
      this.pickService.getPicksByWave(this.wave.id!).subscribe(pickRes => {
        this.listOfAllPicks = pickRes;
        this.listOfDisplayPicks = pickRes;
        this.setupConfirmedQuantity(this.listOfAllPicks);
        this.refreshStatus();
      });
    });
  }
  displayPickList(pickListId: number): void {
    // Let's get the work order by number
    this.pickListService.getPickList(pickListId).subscribe(pickListRes => {
      this.pickList = pickListRes;
      this.lastPageUrl = `/outbound/pick-list?number=${this.pickList.number}`;
      // initial the picks array;
      this.pickService.getPicksByPickList(this.pickList.id).subscribe(pickRes => {
        this.listOfAllPicks = pickRes;
        this.listOfDisplayPicks = pickRes;
        this.setupConfirmedQuantity(this.listOfAllPicks);
        this.refreshStatus();
      });
    });
  }
  displayCartonization(cartonizationId: number): void {
    // Let's get the work order by number
    this.cartonizationService.get(cartonizationId).subscribe(cartonizationRes => {
      this.cartonization = cartonizationRes;
      this.lastPageUrl = `/outbound/cartonization?number=${this.cartonization.number}`;
      // initial the picks array;
      this.pickService.getPicksByCartonization(this.cartonization.id).subscribe(pickRes => {
        this.listOfAllPicks = pickRes;
        this.listOfDisplayPicks = pickRes;
        this.setupConfirmedQuantity(this.listOfAllPicks);
        this.refreshStatus();
      });
    });
  }

  setupConfirmedQuantity(picks: PickWork[]): void {
    picks.forEach(pick => {
      this.mapOfConfirmedQuantity[pick.number] = pick.quantity - pick.pickedQuantity;
    });
  }

  refreshStatus(checkAll?: boolean): void {
    if (checkAll) {
      this.listOfDisplayPicks.every(item => (this.mapOfCheckedId[item.id] = true));
    }
    this.allChecked = this.listOfDisplayPicks.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate = this.listOfDisplayPicks.some(item => this.mapOfCheckedId[item.id]) && !this.allChecked;

    this.allPicksFullyConfirmed = this.listOfDisplayPicks.every(item => item.pickedQuantity >= item.quantity);
  }

  checkAll(value: boolean): void {
    this.listOfDisplayPicks.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data 
  }

  cancelSelectedPicks(): void {
    // make sure we have at least one checkbox checked
    const selectedPicks = this.getSelectedPicks();
    if (selectedPicks.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.pickService.cancelPicks(selectedPicks).subscribe(res => {
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
    const selectedPicks = this.getSelectedPicks();
    if (selectedPicks.length > 0) {
      this.confirming = true;
      this.totalPickCountToConfirm = selectedPicks.length;

      let pickToContainer = false;
      if (this.queryForm) {
        pickToContainer = this.queryForm.controls.pickToContainerFlag.value;
      }

      selectedPicks.forEach(pick => {
        this.pickService
          .confirmPick(pick, this.mapOfConfirmedQuantity[pick.number], pickToContainer, this.containerId)
          .subscribe(pickRes => {
            this.message.success(this.i18n.fanyi('message.action.success'));
            this.totalPickCountToConfirm--;
            if (this.totalPickCountToConfirm === 0) {
              this.displayInformation(true);
              this.confirming = false;
            }
          });
      });
    }
  }
  getSelectedPicks(): PickWork[] {
    const selectedPicks: PickWork[] = [];
    this.listOfAllPicks.forEach((pick: PickWork) => {
      if (this.mapOfCheckedId[pick.id] === true && pick.quantity > pick.pickedQuantity) {
        selectedPicks.push(pick);
      }
    });
    return selectedPicks;
  }

  confirmPick(pick: PickWork): void {
    this.confirming = true;

    let pickToContainer = false;
    if (this.queryForm) {
      pickToContainer = this.queryForm.controls.pickToContainerFlag.value;
    }
    this.pickService
      .confirmPick(pick, this.mapOfConfirmedQuantity[pick.number], pickToContainer, this.containerId)
      .subscribe(pickRes => {
        this.message.success(this.i18n.fanyi('message.action.success'));
        this.displayInformation(true);
        this.confirming = false;
      });
  }
  returnToPreviousPage(): void {
    this.router.navigateByUrl(this.lastPageUrl);
  }
}
