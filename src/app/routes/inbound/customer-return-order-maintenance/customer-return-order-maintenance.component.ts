import { Component, inject, OnInit } from '@angular/core';
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
import { Order } from '../../outbound/models/order'; 
import { OrderLine } from '../../outbound/models/order-line'; 
import { OrderService } from '../../outbound/services/order.service'; 
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { CustomerReturnOrder } from '../models/customer-return-order';
import { CustomerReturnOrderLine } from '../models/customer-return-order-line';
import { ReceiptCategory } from '../models/receipt-category';
import { ReceiptStatus } from '../models/receipt-status.enum';
import { CustomerReturnOrderService } from '../services/customer-return-order.service';
 

@Component({
    selector: 'app-inbound-customer-return-order-maintenance',
    templateUrl: './customer-return-order-maintenance.component.html',
    standalone: false
})
export class InboundCustomerReturnOrderMaintenanceComponent implements OnInit {
  
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  currentCustomerReturnOrder?: CustomerReturnOrder;
  pageTitle: string;
  newCustomerReturnOrder = true;  

  validInventoryStatuses: InventoryStatus[] = [];
  validClients: Client[] = [];
  validCustomers: Customer[] = [];
  
  orderNumberValidateStatus = 'warning'; 


  stepIndex = 0; 
  isSpinning = false; 

  // map of valid OrderLine on an order.
  // key: order id
  // value: OrderLines
  mapOfValidOrderLines: { [key: number]: OrderLine[] } = {};

  constructor(
    private http: _HttpClient,
    private activatedRoute: ActivatedRoute, 
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
      if (params['id']) { 
        this.customerReturnOrderService.getCustomerReturnOrder(params['id'])
          .subscribe(customerReturnOrderRes => {
            this.currentCustomerReturnOrder = customerReturnOrderRes; 

            this.newCustomerReturnOrder = false;
          });
      }
      else {
        // this.currentProductionLine = this.createEmptyProductionLine();
        this.currentCustomerReturnOrder = this.getEmptyCSROrder();
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
  getEmptyCSROrder() : CustomerReturnOrder{
    return {
      id: undefined,
      number: '', 
      warehouseId: this.warehouseService.getCurrentWarehouse().id,

      clientId: undefined,  
      client: undefined,
  
      rmaNumber: '',  
      trackingNumber: '',

      customerId: undefined,
      customer: {
         
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,
        name: "",
        description: "",
        contactorFirstname:  "",
        contactorLastname:  "",
        addressCountry: "",
        addressState: "",
        addressCounty:  "",
        addressCity:  "",
        addressDistrict: "",
        addressLine1: "",
        addressLine2:  "",
        addressPostcode:  "",
      },
  
      category: ReceiptCategory.CUSTOMER_RETURN,
  
      customerReturnOrderLines: [],
  
      status: ReceiptStatus.OPEN,
      allowUnexpectedItem: false, 
 
    }
  } 
  
  itemChanged(orderLine: OrderLine, csrOrderLine: CustomerReturnOrderLine) {
    if (orderLine) {

      console.log(`item name is changed to ${orderLine.item!.name}`);
      csrOrderLine.item = orderLine.item;
      csrOrderLine.itemId = orderLine.itemId;
      csrOrderLine.outboundOrderLine = orderLine;
      csrOrderLine.outboundOrderLineId = orderLine.id;
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
            this.router.navigateByUrl(`/inbound/customer-return?number=${this.currentCustomerReturnOrder?.number}`);
          }, 500);
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
  
  setupOrderNumberOnCSRLine(customerReturnOrderLine: CustomerReturnOrderLine, orderNumber: string) {
    this.orderService.getOrders(orderNumber, true).subscribe(
      {
        next: (orderRes) => {
          if (orderRes.length === 1) {
            console.log(`order is changed to ${orderRes[0].number}`);
            customerReturnOrderLine.outboundOrder = orderRes[0];
            customerReturnOrderLine.outboundOrderNumber = orderRes[0].number;
            // load the valid item for the order
            this.loadItemsForOrder(orderRes[0])
          }
        }
      }
    )
  }
  outboundOrderNumberChanged(customerReturnOrderLine: CustomerReturnOrderLine, event: Event) {
    // clear the original selection
    customerReturnOrderLine.outboundOrder = undefined;
    customerReturnOrderLine.itemId = undefined;
    customerReturnOrderLine.item = undefined;
    customerReturnOrderLine.outboundOrderNumber = undefined;
    const orderNumber = (event.target as HTMLInputElement).value.trim();
    if (orderNumber.length > 0) {
      this.setupOrderNumberOnCSRLine(customerReturnOrderLine, orderNumber);
      
    }
  }
  loadItemsForOrder(order: Order) {
    this.mapOfValidOrderLines[order.id!] = order.orderLines;
  }

       
  procesOutboundOrderQueryResult(customerReturnOrderLine: CustomerReturnOrderLine, selectedOrderNumber: any): void {
    console.log(`start to query with order number ${selectedOrderNumber}`);
    if (selectedOrderNumber.length > 0) {
      this.setupOrderNumberOnCSRLine(customerReturnOrderLine, selectedOrderNumber);
      
    }
    
  }  
}

