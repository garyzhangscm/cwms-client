import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { Client } from '../../common/models/client';
import { Customer } from '../../common/models/customer';
import { ClientService } from '../../common/services/client.service';
import { CustomerService } from '../../common/services/customer.service';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ItemService } from '../../inventory/services/item.service';
import { AllocationStrategyType } from '../../outbound/models/allocation-strategy-type.enum';
import { Order } from '../../outbound/models/order';
import { OrderCategory } from '../../outbound/models/order-category';
import { OrderLine } from '../../outbound/models/order-line';
import { OrderStatus } from '../../outbound/models/order-status.enum';
import { OrderService } from '../../outbound/services/order.service';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { CustomerReturnOrder } from '../models/customer-return-order';
import { CustomerReturnOrderLine } from '../models/customer-return-order-line';
import { ReceiptCategory } from '../models/receipt-category';
import { ReceiptStatus } from '../models/receipt-status.enum';
import { CustomerReturnOrderService } from '../services/customer-return-order.service';

import { Address } from 'cluster';

@Component({
  selector: 'app-inbound-customer-return-order-maintenance',
  templateUrl: './customer-return-order-maintenance.component.html',
})
export class InboundCustomerReturnOrderMaintenanceComponent implements OnInit {
  

  currentCustomerReturnOrder?: CustomerReturnOrder;
  pageTitle: string;
  newCustomerReturnOrder = true;  

  validInventoryStatuses: InventoryStatus[] = [];
  validClients: Client[] = [];
  validCustomers: Customer[] = [];
  
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
    private customerReturnOrderService: CustomerReturnOrderService,
    private userService: UserService,
    private itemService: ItemService,
    private router: Router,
    private inventoryStatusService: InventoryStatusService,   
    private clientService: ClientService, 
    private orderService: OrderService,
    private customerService: CustomerService) { 

    this.pageTitle = this.i18n.fanyi('customer-return-order-maintenance');
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) { 
        this.customerReturnOrderService.getCustomerReturnOrder(params.id)
          .subscribe(customerReturnOrderRes => {
            this.currentCustomerReturnOrder = customerReturnOrderRes; 

            this.newCustomerReturnOrder = false;
          });
      }
      else {
        // this.currentProductionLine = this.createEmptyProductionLine();
        this.currentCustomerReturnOrder = this.getEmptyOrder();
        this.newCustomerReturnOrder = true;
      }
    });
    this.loadAvailableInventoryStatus();  
    this.loadAvailableClients();
    this.loadValidCustomers();
    
  }
  loadAvailableClients() {
    this.clientService.loadClients().subscribe(
      {
        next: (clientRes) => this.validClients = clientRes
      }
    )
  }
 
  loadValidCustomers() {

    this.customerService.loadCustomers().subscribe({
      next: (customerRes) => this.validCustomers = customerRes
    });
  }
  
  loadAvailableInventoryStatus(): void {
    if (this.validInventoryStatuses.length === 0) {
      this.inventoryStatusService
        .loadInventoryStatuses()
        .subscribe(inventoryStatuses => (this.validInventoryStatuses = inventoryStatuses));
    }
  }
   
  customerChanged() {

    console.log(`customer is chagned to ${this.currentCustomerReturnOrder!.customer!.name}`)
    const matchedCustomer = this.validCustomers.find(customer => customer.name === this.currentCustomerReturnOrder!.customer!.name)
    if (matchedCustomer) {
      // clone a new customer structure so any further change won't 
      // mess up with the existing customers auto complete drop down list
      var clone = { ...matchedCustomer };
      this.currentCustomerReturnOrder!.customer = clone;
      this.currentCustomerReturnOrder!.customerId = clone.id!;
    }

  }
  getEmptyOrder() : CustomerReturnOrder{
    return {
      id: undefined,
      number: '', 
      warehouseId: this.warehouseService.getCurrentWarehouse().id,

      clientId: undefined,  
      client: undefined,
  
      RMANumber: '',  
      trackingNumber: '',

      customerId: undefined,
      customer: undefined,
  
      category: ReceiptCategory.CUSTOMER_RETURN,
  
      customerReturnOrderLines: [],
  
      status: ReceiptStatus.OPEN,
      allowUnexpectedItem: false, 
 
    }
  } 
  
  itemChanged(event: Event, csrOrderLine: CustomerReturnOrderLine) {
    
    console.log(`item name is changed to ${(event.target as HTMLInputElement).value}`);
    const itemName: string = (event.target as HTMLInputElement).value.trim();
    if (itemName.length === 0) {
      return;
    }


  }
  
  
  addExtraCSROrderLine(): void {
    this.currentCustomerReturnOrder!.customerReturnOrderLines = [...this.currentCustomerReturnOrder!.customerReturnOrderLines, this.getEmptyOrderLine()];
  }

  getEmptyOrderLine(): CustomerReturnOrderLine {
    return {
      id: undefined,
      
      number: "", 
      
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      itemId: undefined,
      item: {
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,
        name: '',
        description: '',
        allowCartonization: undefined,
        itemPackageTypes: [
          {
            id: undefined,
            warehouseId: this.warehouseService.getCurrentWarehouse().id,
            companyId: this.companyService.getCurrentCompany()!.id,
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
      expectedQuantity: 0,
      receivedQuantity: 0,
      
      overReceivingQuantity:  0,
      overReceivingPercent:  0,

      qcQuantity:  0,
      qcPercentage:  0,
      qcQuantityRequested:  0,
      
      outboundOrderLineId:  undefined, 
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
      
      this.customerReturnOrderService.addCustomerReturnOrder(this.currentCustomerReturnOrder!).subscribe({
        next: () => {

          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/outbound/order?number=${this.currentCustomerReturnOrder?.number}`);
          }, 2500);
        },
        error: () => {
          this.isSpinning = false;
        },
      });
 
  }
  
  
  orderNumberChange(event: Event) {
    // assign the value to the order, in case we press key to let the system
    // generate the next order number
    this.currentCustomerReturnOrder!.number = (event.target as HTMLInputElement).value; 
    if (this.currentCustomerReturnOrder!.number) {
      // THE USER input the order number, let's make sure it is not exists yet
      this.customerReturnOrderService.getCustomerReturnOrders(this.currentCustomerReturnOrder!.number).subscribe({
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

  removeCSROrderLine(index: number) {

    console.log(`remove index: ${index}`);
    this.currentCustomerReturnOrder!.customerReturnOrderLines.splice(index, 1);
    console.log(`after splice, we still have ${this.currentCustomerReturnOrder!.customerReturnOrderLines.length} lines`);

    this.currentCustomerReturnOrder!.customerReturnOrderLines = [...this.currentCustomerReturnOrder!.customerReturnOrderLines];
 
  }
  
  outboundOrderNumberChanged(customerReturnOrderLine: CustomerReturnOrderLine, event: Event) {
    const orderNumber = (event.target as HTMLInputElement).value.trim();
    if (orderNumber.length > 0) {

      this.orderService.getOrders(orderNumber, false).subscribe(
        {
          next: (orderRes) => {
            if (orderRes.length === 1) {
              console.log(`order is changed to ${orderRes[0].number}`);
              customerReturnOrderLine.outboundOrder = orderRes[0];
            }
          }
        }
      )
    }
  }
       
  procesOutboundOrderQueryResult(customerReturnOrderLine: CustomerReturnOrderLine, selectedOrderNumber: any): void {
    console.log(`start to query with order number ${selectedOrderNumber}`);
    this.orderService.getOrders(selectedOrderNumber, false).subscribe(
      {
        next: (orderRes) => {
          if (orderRes.length === 1) {
            console.log(`order is changed to ${orderRes[0].number}`);
            customerReturnOrderLine.outboundOrder = orderRes[0];
          }
        }
      }
    )
    
  }  
}

