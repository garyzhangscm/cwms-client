import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzCascaderOption } from 'ng-zorro-antd/cascader';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Address } from 'ngx-google-places-autocomplete/objects/address';

import { UserService } from '../../auth/services/user.service';
import { Customer } from '../../common/models/customer';
import { CustomerService } from '../../common/services/customer.service';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ItemService } from '../../inventory/services/item.service';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { LocationGroupTypeService } from '../../warehouse-layout/services/location-group-type.service';
import { LocationGroupService } from '../../warehouse-layout/services/location-group.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
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
  existingCustomer = 'true';
  validCustomers: Customer[] = [];

  validInventoryStatuses: InventoryStatus[] = [];
  warehouses: Warehouse[] | undefined;

  avaiableLocationGroups: LocationGroup[] = [];

  avaiableLocations: WarehouseLocation[] = [];
  orderNumberValidateStatus = 'warning'; 


  stepIndex = 0; 
  isSpinning = false;
  saveNewCustomer = false; 
  newCustomer?: Customer;

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
    private inventoryStatusService: InventoryStatusService, 
    private locationGroupService: LocationGroupService, 
    private locationGroupTypeService: LocationGroupTypeService, 
    private locationService: LocationService, 
    private customerService: CustomerService) { 

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
    this.loadShippingStageLocationGroups();
    // init the customer auto complete if necessar
    this.customerOptionChanged();
    
    this.loadScript('https://maps.googleapis.com/maps/api/js?libraries=places&key=AIzaSyDkPmh0PEC7JTCutUhWuN3BUU38M2fvR5s&sensor=false&language=en');
  }

  loadShippingStageLocationGroups(): void {

    this.locationGroupTypeService.loadLocationGroupTypes(true).subscribe(
      {
        next: (shippingStageTypesRes) => {
          let locationGroupTypes: number[] = [];
          shippingStageTypesRes.forEach(shippingStageType => {
            locationGroupTypes.push(shippingStageType.id);
          })
          this.locationGroupService.getLocationGroups(locationGroupTypes, []).subscribe(
            {
              next: (locationGroupsRes) => {
                this.avaiableLocationGroups = locationGroupsRes;
              }
            }
          )
        } , 
        
      }
    )
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
      shipToCustomer: this.getEmptyCustomer(),
 
    }
  }
  getEmptyCustomer(): Customer{
    return {       
      name: "",
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      description:  "",
      contactorFirstname:  "",
      contactorLastname:  "",
      addressCountry:  "",
      addressState:  "", 
      addressCity:  "", 
      addressLine1:  "", 
      addressPostcode:  "",
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
    const itemName: string = (event.target as HTMLInputElement).value.trim();
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
    if (this.existingCustomer === 'false' && this.saveNewCustomer) {
      // ok we will save the customer information first, then
      // assign it to the order before we finally save the order
      this.customerService.addCustomer(this.newCustomer!)
          .subscribe({
            next: (customerRes) => {
              console.log(`customer saved! \n ${JSON.stringify(customerRes)}`);
              this.currentOrder!.shipToCustomer = customerRes;
              this.currentOrder!.shipToCustomerId = customerRes.id!;
              
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
              });
            }, 
            error: () => {
              this.isSpinning = false;
            },
          })
    }
    else {
      
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
      });
    }
  }

  orderTransferWarehouseIdChanged() {
    console.log(`order's transfer warehouse id  is changed to ${this.currentOrder!.transferReceiptWarehouseId}`);
    this.currentOrder!.transferReceiptWarehouse = this.warehouses?.find(
      warehouse => warehouse.id === this.currentOrder!.transferReceiptWarehouseId
    );
  }
  orderNumberChange(event: Event) {
    // assign the value to the order, in case we press key to let the system
    // generate the next order number
    this.currentOrder!.number = (event.target as HTMLInputElement).value;
    console.log(`user input order number: ${this.currentOrder!.number}`);
    console.log(`user input order number: ${(event.target as HTMLInputElement).value}`);
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

  removeOrderLine(index: number) {

    console.log(`remove index: ${index}`);
    this.currentOrder!.orderLines.splice(index, 1);
    console.log(`after splice, we still have ${this.currentOrder!.orderLines.length} lines`);

    this.currentOrder!.orderLines = [...this.currentOrder!.orderLines];
 
  }

  stageLocationGroupChange(): void {
      console.log( `location group id is changed to ${this.currentOrder!.stageLocationGroupId}`) ;

      let locationGroupIds = this.avaiableLocationGroups.filter(
        locationGroup => locationGroup.id === this.currentOrder!.stageLocationGroupId
      ).map(locationGroup => locationGroup.id).join(",");
      this.locationService.getLocations(undefined, locationGroupIds, undefined, true).subscribe(
        {
          next: (locationRes) => this.avaiableLocations = locationRes
        }
      )
  } 
  customerOptionChanged() {
    if (this.existingCustomer === 'true' && this.validCustomers.length === 0) {

      this.loadValidCustomers();
    }
    else {
      // setup the new customer for later use
      this.newCustomer = {
          name: "",
          description: "",
          warehouseId: this.warehouseService.getCurrentWarehouse().id,
          contactorFirstname: "",
          contactorLastname: "",
          addressCountry: "",
          addressState: "", 
          addressCity:"", 
          addressLine1: "",
          addressPostcode: "",
      }
    }
  }

  loadValidCustomers() {

    this.customerService.loadCustomers().subscribe({
      next: (customerRes) => this.validCustomers = customerRes
    });
  }
  shipToCustomerChanged() {

    console.log(`ship to customer is chagned to ${this.currentOrder!.shipToCustomer!.name}`)
    const matchedCustomer = this.validCustomers.find(customer => customer.name === this.currentOrder!.shipToCustomer!.name)
    if (matchedCustomer) {
      // clone a new customer structure so any further change won't 
      // mess up with the existing customers auto complete drop down list
      var clone = { ...matchedCustomer };
      this.currentOrder!.shipToCustomer = clone;
      this.currentOrder!.shipToCustomerId = clone.id!;
    }

  }
  
  handleNewCustomerAddressChange(address: Address) {  
    // this.warehouseAddress = address;
    address.address_components.forEach(
      addressComponent => {
         
        if (addressComponent.types[0] === 'street_number') {
          // street number
          // address line 1 = street number + street name
          this.newCustomer!.addressLine1 = `${addressComponent.long_name  } ${  this.newCustomer!.addressLine1}`;
        }
        else if (addressComponent.types[0] === 'route') {
          // street name
          // address line 1 = street number + street name
          this.newCustomer!.addressLine1 = `${this.newCustomer!.addressLine1  } ${  addressComponent.long_name}`;
        } 
        else if (addressComponent.types[0] === 'locality') {
          // city
          this.newCustomer!.addressCity = addressComponent.long_name;
        } 
        else if (addressComponent.types[0] === 'administrative_area_level_2') {
          // county
          this.newCustomer!.addressCounty = addressComponent.long_name;
        } 
        else if (addressComponent.types[0] === 'administrative_area_level_1') {
          // city
          this.newCustomer!.addressState = addressComponent.long_name;
        } 
        else if (addressComponent.types[0] === 'country') {
          // city
          this.newCustomer!.addressCountry = addressComponent.long_name;
        } 
        else if (addressComponent.types[0] === 'postal_code') {
          // city
          this.newCustomer!.addressPostcode = addressComponent.long_name;
        } 
      }

    )
  }

  
  public loadScript(url: string) {
    const body = <HTMLDivElement> document.body;
    const script = document.createElement('script');
    script.innerHTML = '';
    script.src = url;
    script.async = false;
    script.defer = true;
    body.appendChild(script);
  }
}