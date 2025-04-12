import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message'; 

import { UserService } from '../../auth/services/user.service';
import { Client } from '../../common/models/client';
import { Customer } from '../../common/models/customer';
import { Supplier } from '../../common/models/supplier';
import { ClientService } from '../../common/services/client.service';
import { CustomerService } from '../../common/services/customer.service';
import { SupplierService } from '../../common/services/supplier.service';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ItemService } from '../../inventory/services/item.service';
import { Carrier } from '../../transportation/models/carrier';
import { CarrierServiceLevel } from '../../transportation/models/carrier-service-level';
import { CarrierService } from '../../transportation/services/carrier.service';
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
import { OrderService } from '../services/order.service';

@Component({
    selector: 'app-outbound-order-maintenance',
    templateUrl: './order-maintenance.component.html',
    standalone: false
})
export class OutboundOrderMaintenanceComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  orderCategories = OrderCategory;
  orderCategoriesKeys = Object.keys(this.orderCategories);
  orderStatuses = OrderStatus;
  allocationStrategies = AllocationStrategyType;
  allocationStrategiesKeys = Object.keys(this.allocationStrategies);

  currentOrder?: Order;
  pageTitle: string;
  newOrder = true;
  existingCustomer = 'true';
  validCustomers: Customer[] = [];

  // supplier is only used by outsourcing orders
  existingSupplier = 'true';
  validSuppliers: Supplier[] = [];
  filterValidSuppliers: Supplier[] = [];

  validInventoryStatuses: InventoryStatus[] = [];
  warehouses: Warehouse[] | undefined;
  availableInventoryStatus?: InventoryStatus;

  avaiableLocationGroups: LocationGroup[] = [];

  avaiableLocations: WarehouseLocation[] = [];
  orderNumberValidateStatus = 'warning'; 
  shipStageLocationGroupStatus = 'success'; 
  shipStageLocationStatus = 'success'; 

  avaiableCarriers: Carrier[] = [];
  availableClients: Client[] = [];
  avaiableServiceLevel: CarrierServiceLevel[] = [];

  stepIndex = 0; 
  isSpinning = false;
  saveNewCustomer = false; 
  newCustomer?: Customer;

  constructor(
    private http: _HttpClient,
    private activatedRoute: ActivatedRoute, 
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
    private customerService: CustomerService,
    private carrierService: CarrierService,
    private clientService: ClientService,
    private supplierService: SupplierService) { 

    this.pageTitle = this.i18n.fanyi('menu.main.outbound.order-maintenance');
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        // Get the production line by ID
        this.orderService.getOrder(params['id'])
          .subscribe(orderRes => {
            this.currentOrder = orderRes; 

            this.newOrder = false;
            this.orderNumberValidateStatus = 'success';
            // reload the carrier and service level drop down just in case the order 
            // has the carrier and service setup
            this.loadCarriers();
          });
      }
      else {
        // this.currentProductionLine = this.createEmptyProductionLine();
        this.currentOrder = this.getEmptyOrder();
        this.newOrder = true;
        this.loadCarriers();
      }
    });
    this.loadValidInventoryStatus();
    this.loadAvailableInventoryStatus();
    this.loadWarehouses();
    this.loadValidClients();
    this.loadShippingStageLocationGroups();
    // init the customer auto complete if necessar
    this.customerOptionChanged();
    this.loadValidSuppliers();
    
    //this.loadScript('https://maps.googleapis.com/maps/api/js?libraries=places&key=AIzaSyDkPmh0PEC7JTCutUhWuN3BUU38M2fvR5s&sensor=false&language=en');
  }

  loadCarriers(): void {

    this.carrierService.loadCarriers().subscribe(
      {
        next: (carrierRes) => {
          this.avaiableCarriers = carrierRes; 
          if (this.currentOrder?.carrierId) {
            // if the current order has both the carrier and service level setup
            // load both the carrier and service level 
            
            this.avaiableServiceLevel = [];

            this.avaiableCarriers.filter(
              carrier => carrier.id === this.currentOrder!.carrierId
            ).forEach(
              carrier => {
                this.avaiableServiceLevel = [...this.avaiableServiceLevel, ...carrier.carrierServiceLevels]; 
              }
            )

          }
        } ,         
      }
    )
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
  
  loadValidInventoryStatus(): void {
    if (this.validInventoryStatuses.length === 0) {
      this.inventoryStatusService
        .loadInventoryStatuses()
        .subscribe(inventoryStatuses => (this.validInventoryStatuses = inventoryStatuses));
    }
  }

  loadAvailableInventoryStatus() : void {
    
    this.inventoryStatusService.getAvailableInventoryStatuses()
    .subscribe(inventoryStatuses => {
      if (inventoryStatuses.length > 0) {
        this.availableInventoryStatus = inventoryStatuses[0];
      }
    });
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

      orderBillableActivities: [],
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
      companyId: this.companyService.getCurrentCompany()!.id,
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
    if (itemName.length === 0) {
      return;
    }
    this.itemService.getItems(itemName).subscribe(
      itemRes => {
        if (itemRes.length === 1) {
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
    let defaultInventoryStatus : InventoryStatus = {
      id: undefined,
      name: '',
      description: '',
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
    };

    // get the default inventory status for the newly added line
    if (this.validInventoryStatuses.length === 1) {
      defaultInventoryStatus = this.validInventoryStatuses[0]; 
    }
    else if (this.availableInventoryStatus != null) {
      defaultInventoryStatus = this.availableInventoryStatus; 

    }
    // get the maximun number of existing order lines
    let maxOrderLineNumber : number = 0;
    if (this.currentOrder!.orderLines.length > 0) {
      this.currentOrder!.orderLines.forEach(
        orderLine => {
          let orderLineNumber = parseInt(orderLine.number);
          if (!Number.isNaN(maxOrderLineNumber)) {
            maxOrderLineNumber = Math.max(maxOrderLineNumber, orderLineNumber);
          }
        }
      )
    }

    return {
      id: undefined,      
      number: (maxOrderLineNumber + 1).toString(), 
      orderNumber: this.currentOrder!.number,
      warehouseId: this.warehouseService.getCurrentWarehouse().id,

      orderLineBillableActivities: [],
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
      inventoryStatus: defaultInventoryStatus,
      inventoryStatusId: defaultInventoryStatus.id,      
      autoRequestShippingLabel: false,
      
    };
  }

  allowForManualPickChanged(allowForManualPick: boolean) {
    console.log(`allow for manual pick : ${allowForManualPick}`);

    this.validateShipStageLocationAndGroupRequirement();
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
      return this.orderNumberValidateStatus === 'success' && 
      this.shipStageLocationGroupStatus === 'success' &&
      this.shipStageLocationStatus === 'success'; 
    }

    return true;
  }

  confirm() { 
    this.isSpinning = true;
    // for outsourcing order, we will clear the stage location
    // for non outsource order, we will clear the supplier(supplier is the one
    // who fulfill the outsourcing order)
    if (this.isOutsourcingOrder(this.currentOrder!)) {
      this.currentOrder!.stageLocationGroup = undefined;
      this.currentOrder!.stageLocationGroupId = undefined;
      this.currentOrder!.stageLocation = undefined;
      this.currentOrder!.stageLocationId = undefined;
    }
    else {
      this.currentOrder!.supplier = undefined;
      this.currentOrder!.supplierId = undefined;

    }
    if (this.existingCustomer === 'false' && this.saveNewCustomer) {
      // ok we will save the customer information first, then
      // assign it to the order before we finally save the order
      this.customerService.addCustomer(this.newCustomer!)
          .subscribe({
            next: (customerRes) => {
              console.log(`customer saved! \n ${JSON.stringify(customerRes)}`);
              this.currentOrder!.shipToCustomer = customerRes;
              this.currentOrder!.shipToCustomerId = customerRes.id!;

              // copy the address information from the customer to the order
              this.copyAddressInformation(this.currentOrder!, customerRes);
              
              this.orderService.addOrder(this.currentOrder!).subscribe({
                next: () => {

                  this.messageService.success(this.i18n.fanyi('message.action.success'));
                  setTimeout(() => {
                    this.isSpinning = false;
                    this.router.navigateByUrl(`/outbound/order?number=${this.currentOrder?.number}`);
                  }, 500);
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
      
      // copy the address information from the customer to the order
      this.copyAddressInformation(this.currentOrder!, this.currentOrder!.shipToCustomer!);
      
      this.orderService.addOrder(this.currentOrder!).subscribe({
        next: () => {

          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/outbound/order?number=${this.currentOrder?.number}`);
          }, 500);
        },
        error: () => {
          this.isSpinning = false;
        },
      });
    }
  }

  onSupplierInputChange(e: Event): void {
    const value = (e.target as HTMLInputElement).value;
    if (value.length === 0) {
      // the user didn't input any value in the supplire filter, let's
      // show all the valid supplier
      this.filterValidSuppliers = this.validSuppliers;
    }
    else {
      // the user input something, furture filter out the result by
      // the input value, from the supplier's name or description
      this.filterValidSuppliers = this.validSuppliers.filter(
        supplier => supplier.name.toLowerCase().indexOf(value.toLowerCase()) >= 0 || 
              supplier.description.toLowerCase().indexOf(value.toLowerCase()) >= 0
      );
    } 
  }

  copyAddressInformation(order: Order, customer: Customer) {
    order.shipToContactorFirstname = customer.contactorFirstname;
    order.shipToContactorLastname = customer.contactorLastname;
    order.shipToAddressCountry = customer.addressCountry;
    order.shipToAddressState  = customer.addressState;
    order.shipToAddressCounty = customer.addressCounty;
    order.shipToAddressCity = customer.addressCity;
    order.shipToAddressLine1 = customer.addressLine1;
    order.shipToAddressLine2 = customer.addressLine2;
    order.shipToAddressPostcode = customer.addressPostcode;
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

  carrierChange(): void {
    console.log( `carrier ID is changed to ${this.currentOrder!.carrierId}`) ;

      // reset the carrier's service level when the carrier is changed
      this.currentOrder!.carrierServiceLevelId = undefined;
      this.currentOrder!.carrierServiceLevel == undefined;

    this.avaiableServiceLevel = [];
    if (this.currentOrder!.carrierId == null) {
      this.currentOrder!.carrier == undefined;
      // clear the service level if the carrier is cleared;
      return;
    }
    this.avaiableCarriers.filter(
      carrier => carrier.id === this.currentOrder!.carrierId
    ).forEach(
      carrier => {
        this.avaiableServiceLevel = [...this.avaiableServiceLevel, ...carrier.carrierServiceLevels];
        this.currentOrder!.carrier = carrier; 
      }
    )
  } 
  carrierServiceChange(): void {
    
    this.currentOrder!.carrierServiceLevel == undefined;
    this.avaiableServiceLevel.filter(
      service => service.id === this.currentOrder!.carrierServiceLevelId
    ).forEach(
      service => { 
        this.currentOrder!.carrierServiceLevel = service; 
      }
    )
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
      this.validateShipStageLocationAndGroupRequirement();
  } 
  stageLocationChanged(): void {
    
    this.validateShipStageLocationAndGroupRequirement();

  }
  validateShipStageLocationAndGroupRequirement() {
    
    this.shipStageLocationGroupStatus = "success";
    this.shipStageLocationStatus = "success";

    if (this.currentOrder!.allowForManualPick) {
      if (this.currentOrder!.stageLocationId == null) {
        this.shipStageLocationStatus = "requiredForManualPickOrder";
      } 
      if (this.currentOrder!.stageLocationGroupId == null) {
        this.shipStageLocationGroupStatus = "requiredForManualPickOrder";
      }  
    }
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
          companyId: this.companyService.getCurrentCompany()!.id,
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

  loadValidClients() {

    this.clientService.getClients().subscribe({
      next: (clientRes) => this.availableClients = clientRes
       
    });
  }
  loadValidCustomers() {

    this.customerService.loadCustomers().subscribe({
      next: (customerRes) => this.validCustomers = customerRes
    });
  }
  loadValidSuppliers() {

    this.supplierService.loadSuppliers().subscribe({
      next: (supplierRes) => {
        this.validSuppliers = supplierRes;
        this.filterValidSuppliers = supplierRes;
      }
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
  
  clientChanged() {
    if (this.currentOrder!.clientId) {

      this.currentOrder!.client = this.availableClients.find(
        availableClient => availableClient.id === this.currentOrder!.clientId
      );
    }
    else {
      this.currentOrder!.client = undefined;
    }
  }

  supplierChanged() {

    console.log(`supplier is chagned to ${this.currentOrder!.supplier!.name}`)
    if (this.currentOrder!.supplier) {
      this.currentOrder!.supplierId = this.currentOrder?.supplier.id;
    }

  }
  
  handleNewCustomerAddressChange(address: google.maps.places.PlaceResult) {  
    // this.warehouseAddress = address;
    address.address_components!.forEach(
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

  
  isOutsourcingOrder(order: Order): boolean {
    return this.orderService.isOutsourcingOrder(order);
  }

  // load google address script
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