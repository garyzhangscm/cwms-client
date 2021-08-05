import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ItemService } from '../../inventory/services/item.service';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { AllocationStrategyType } from '../models/allocation-strategy-type.enum';
import { Order } from '../models/order';
import { OrderCategory } from '../models/order-category';
import { OrderLine } from '../models/order-line';
import { OrderStatus } from '../models/order-status.enum';
import { OrderLineService } from '../services/order-line.service';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-outbound-order-maintenance',
  templateUrl: './order-maintenance.component.html',
})
export class OutboundOrderMaintenanceComponent implements OnInit {

  orderCategories = OrderCategory;
  allocationStrategies = AllocationStrategyType;

  currentOrder?: Order;
  pageTitle: string;
  newOrder = true;

  validInventoryStatuses: InventoryStatus[] = [];
  warehouses: Warehouse[] | undefined;

  orderNumberValidateStatus = 'warning';

  stepIndex = 0; 
  isSpinning = false;
  constructor(
    private http: _HttpClient,
    private activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private messageService: NzMessageService,
    private orderService: OrderService,
    private userService: UserService,
    private itemService: ItemService,
    private router: Router,
    private inventoryStatusService: InventoryStatusService) { 

    this.pageTitle = this.i18n.fanyi('menu.main.outbound.order-maintenance');
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        // Get the production line by ID
        this.orderService.getOrder(params.id)
          .subscribe(orderRes => {
            this.currentOrder = orderRes; 

            this.newOrder = false;
          });
      }
      else {
        // this.currentProductionLine = this.createEmptyProductionLine();
        this.currentOrder = this.getEmptyOrder();
        this.newOrder = true;
      }
    });
    this.loadAvailableInventoryStatus();
    this.loadWarehouses();
  }

  
  loadAvailableInventoryStatus(): void {
    if (this.validInventoryStatuses.length === 0) {
      this.inventoryStatusService
        .loadInventoryStatuses()
        .subscribe(inventoryStatuses => (this.validInventoryStatuses = inventoryStatuses));
    }
  }
  
  loadWarehouses(): void {  
      this.warehouseService
        .getWarehouseByUser(this.companyService.getCurrentCompany()!.code, this.userService.getCurrentUsername())
        .subscribe((warehouses: Warehouse[]) => {
          // skip the current warehouse since we won't transfer within the same warehouse
          this.warehouses = warehouses.filter(warehouse => warehouse.id !== this.warehouseService.getCurrentWarehouse().id ); 
        });
    
  }

  getEmptyOrder() : Order{
    return {
      id: undefined,
      number: '',

      status: OrderStatus.OPEN,
      category: OrderCategory.SALES_ORDER,
      orderLines: [],
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
 
    }
  }

  orderCategoryChanged() {
    console.log(`current order's category is changed to ${this.currentOrder?.category}`)
  }

  lineNumberChanged(orderLine: OrderLine) {
    
    console.log(`orderLine's number is changed to ${orderLine.number}`);

  }
  itemChanged(event: Event, orderLine: OrderLine) {
    
    console.log(`item name is changed to ${(event.target as HTMLInputElement).value}`);
    const itemName: string = (event.target as HTMLInputElement).value;
    this.itemService.getItems(itemName).subscribe(
      itemRes => {
        if (itemRes.length > 0) {
          // we should only get one item by the name
          orderLine.item = itemRes[0];
          orderLine.itemId = itemRes[0].id;
        }
      }
    )


  }

  inventoryStatusChanged(orderLine: OrderLine) {
    
    this.validInventoryStatuses
      .filter(inventoryStatus => inventoryStatus.id == orderLine.inventoryStatus!.id)
      .forEach(inventoryStatus => {
        orderLine.inventoryStatus = inventoryStatus, 
        orderLine.inventoryStatusId = inventoryStatus.id
      });
    console.log(`orderLine's number is changed to ${orderLine.inventoryStatus!.name}`);

  } 


  allocationStratetyChanged(orderLine: OrderLine) {
    
    console.log(`orderLine's number is changed to ${orderLine.allocationStrategyType}`);

  }
 
  
  addExtraOrderLine(): void {
    this.currentOrder!.orderLines = [...this.currentOrder!.orderLines, this.getEmptyOrderLine()];
  }

  getEmptyOrderLine(): OrderLine {
    return {
      id: undefined,
      
      number: "", 
      orderNumber: this.currentOrder!.number,
      warehouseId: this.warehouseService.getCurrentWarehouse().id,

      expectedQuantity: 0,
      openQuantity: 0,
      inprocessQuantity: 0,
      shippedQuantity: 0,
      productionPlanInprocessQuantity: 0,
      productionPlanProducedQuantity: 0,
      allocationStrategyType: AllocationStrategyType.FIRST_IN_FIRST_OUT,
 
      item: {
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        name: '',
        description: '',
        allowCartonization: undefined,
        itemPackageTypes: [
          {
            id: undefined,
            warehouseId: this.warehouseService.getCurrentWarehouse().id,
            description: '',
            name: '',
            itemUnitOfMeasures: [],
          },
        ],

        client: undefined,
        itemFamily: undefined,
        unitCost: undefined,

        allowAllocationByLPN: undefined,
        allocationRoundUpStrategyType: undefined,

        allocationRoundUpStrategyValue: undefined,

        trackingVolumeFlag: undefined,
        trackingLotNumberFlag: undefined,
        trackingManufactureDateFlag: undefined,
        shelfLifeDays: undefined,
        trackingExpirationDateFlag: undefined,
      },
      inventoryStatus: {
        id: undefined,
        name: '',
        description: '',
      },
    };
  }

  previousStep() {
    this.stepIndex--;
  }
  nextStep() {
    if (this.passValidation()) {

      this.stepIndex++;
    }
  }
  passValidation() : boolean {

    if (this.stepIndex === 0) {
      return this.orderNumberValidateStatus === 'success';
    }

    return true;
  }

  confirm() { 
    this.isSpinning = true;
    this.orderService.addOrder(this.currentOrder!).subscribe({
      next: () => {

        this.messageService.success(this.i18n.fanyi('message.action.success'));
        setTimeout(() => {
          this.isSpinning = false;
          this.router.navigateByUrl(`/outbound/order?number=${this.currentOrder?.number}`);
        }, 2500);
      },
      error: () => {
        this.isSpinning = false;
      },
    }
    )
  }

  orderTransferWarehouseIdChanged() {
    console.log(`order's transfer warehouse id  is changed to ${this.currentOrder!.transferReceiptWarehouseId}`);
    this.currentOrder!.transferReceiptWarehouse = this.warehouses?.find(
      warehouse => warehouse.id === this.currentOrder!.transferReceiptWarehouseId
    );
  }
  orderNumberChange() {
    if (this.currentOrder!.number) {
      // THE USER input the order number, let's make sure it is not exists yet
      this.orderService.getOrders(this.currentOrder!.number).subscribe({
        next: (orderRes) => {
          if (orderRes.length > 0) {
            // the order is already exists 
            this.orderNumberValidateStatus = 'numberExists'
          }
        }
      })
      this.orderNumberValidateStatus = 'success'
    }
    else {
      this.orderNumberValidateStatus = 'required'
    }
  }
}