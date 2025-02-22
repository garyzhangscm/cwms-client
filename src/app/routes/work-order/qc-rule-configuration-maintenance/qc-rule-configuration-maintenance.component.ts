import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder , FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TransferChange, TransferItem } from 'ng-zorro-antd/transfer';

import { UserService } from '../../auth/services/user.service';
import { Customer } from '../../common/models/customer';
import { Supplier } from '../../common/models/supplier';
import { CustomerService } from '../../common/services/customer.service';
import { SupplierService } from '../../common/services/supplier.service';
import { InventoryLock } from '../../inventory/models/inventory-lock';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { ItemFamily } from '../../inventory/models/item-family';
import { InventoryLockService } from '../../inventory/services/inventory-lock.service';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ItemFamilyService } from '../../inventory/services/item-family.service';
import { ItemService } from '../../inventory/services/item.service';
import { Order } from '../../outbound/models/order';
import { OrderService } from '../../outbound/services/order.service';
import { QCRule } from '../../qc/models/qc-rule';
import { QCRuleConfiguration } from '../../qc/models/qc-rule-configuration';
import { QcRuleConfigurationService } from '../../qc/services/qc-rule-configuration.service';
import { QcRuleService } from '../../qc/services/qc-rule.service';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLine } from '../models/production-line';
import { WorkOrderQcRuleConfiguration } from '../models/work-order-qc-rule-configuration';
import { WorkOrderQcRuleConfigurationRule } from '../models/work-order-qc-rule-configuration-rule';
import { ProductionLineService } from '../services/production-line.service';
import { WorkOrderQcRuleConfigurationService } from '../services/work-order-qc-rule-configuration.service';
import { WorkOrderService } from '../services/work-order.service';

@Component({
    selector: 'app-work-order-qc-rule-configuration-maintenance',
    templateUrl: './qc-rule-configuration-maintenance.component.html',
    standalone: false
})
export class WorkOrderQcRuleConfigurationMaintenanceComponent implements OnInit {
 
  
  qcRuleList: TransferItem[] = [];
  allQCRules: QCRule[] = [];
  assignedQCRuleIds: number[] = [];
  unassignedQCRuleText: string = "";
  assignedQCRuleText: string = "";
  
  stepIndex = 0;
  pageTitle: string = "";
  newQCRuleConfiguration = true;
  isSpinning = false; 
  validproductionLines: ProductionLine[] = [];  
  currentQCRuleConfiguration!: WorkOrderQcRuleConfiguration;

  // whether we configure for qc sample, or for work order
  // can be either sample, or workOrder
  configureBy = "sample"

  warehouses: Warehouse[] = [];
  validCustomers: Customer[] = [];
  warehouseSpecific = false;
  
  validItemFamilies: ItemFamily[] = [];
  validInventoryStatuses: InventoryStatus[] = [];
  validInventoryLocks: InventoryLock[] = [];

  
  formatterPercent = (value: number): string => `${value} %`;
  // parserPercent = (value: string): string => value.replace(' %', '');
  parserPercent = (value: string): number => parseFloat(value?.replace('%', ''));

  constructor(private http: _HttpClient,
    private companyService: CompanyService,
    private fb: UntypedFormBuilder,
    private workOrderQcRuleConfigurationService: WorkOrderQcRuleConfigurationService,
    private messageService: NzMessageService,
    private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private warehouseService: WarehouseService,  
    private productionLineService: ProductionLineService,
    private userService: UserService,
    private workOrderService: WorkOrderService,
    private customerService: CustomerService,
    private inventoryLockService: InventoryLockService,
    private qcRuleService: QcRuleService,
    private localCacheService: LocalCacheService,
    private orderService: OrderService,
    private itemService: ItemService,
    private itemFamilyService: ItemFamilyService,
    private inventoryStatusService: InventoryStatusService,
    private activatedRoute: ActivatedRoute) {

    this.pageTitle = this.i18n.fanyi('menu.main.work-order.qc-rule-config');
    this.currentQCRuleConfiguration = this.createEmptyQcRuleConfiguration();
 
  }
  
  
  loadWarehouses(): void {
    console.log(`Start to load warehouse ${this.userService.getCurrentUsername()}`); 
      this.warehouseService
        .getWarehouseByUser(this.companyService.getCurrentCompany()!.code, this.userService.getCurrentUsername())
        .subscribe((warehouses: Warehouse[]) => {
          this.warehouses = warehouses;  
        });
  } 

  createEmptyQcRuleConfiguration(): WorkOrderQcRuleConfiguration {
    return {  
      companyId: this.companyService.getCurrentCompany()!.id,
      warehouseId: this.warehouseService.getCurrentWarehouse()!.id,
   
      workOrderQCRuleConfigurationRules: [], 
      qcQuantity: 0,
      qcQuantityPerWorkOrder: 0,
      qcPercentagePerWorkOrder: 0,
      customer: this.getEmptyCustomer(),
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

  ngOnInit(): void {

     
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) { 
        this.isSpinning = true;
        this.workOrderQcRuleConfigurationService.getQCRuleConfiguration(params['id'])
          .subscribe(qcRuleConfiguration => {
             this.currentQCRuleConfiguration = qcRuleConfiguration;
             this.newQCRuleConfiguration = false; 
             this.refreshDetailInformation(this.currentQCRuleConfiguration);
             this.isSpinning = false;
            
          });
      }
      else {
        
        this.isSpinning = true;
        this.newQCRuleConfiguration = true;
        this.isSpinning = false;
      }
    });
    this.loadWarehouses();
    this.loadQCRules();
    this.loadProductionLines();
    this.loadValidCustomers();
    this.loadItemFamlies();
    this.loadValidInventoryLocks();
    this.loadAvailableInventoryStatus();
    
  }


  refreshDetailInformation(workOrderQcRuleConfiguration: WorkOrderQcRuleConfiguration) {
     
    this.loadWarehouse(workOrderQcRuleConfiguration); 

    this.loadOrder(workOrderQcRuleConfiguration); 
  
    this.loadCustomer(workOrderQcRuleConfiguration); 
    
    this.loadItem(workOrderQcRuleConfiguration); 
    
    this.loadItemFamily(workOrderQcRuleConfiguration); 

    this.loadInventoryStatus(workOrderQcRuleConfiguration);

    this.loadInventoryLock(workOrderQcRuleConfiguration);

  }

  
  loadWarehouse(workOrderQcRuleConfiguration: WorkOrderQcRuleConfiguration){
    if (workOrderQcRuleConfiguration.warehouseId) {
 
      this.localCacheService
      .getWarehouse(workOrderQcRuleConfiguration.warehouseId)
      .subscribe((warehouse: Warehouse) => {

        workOrderQcRuleConfiguration.warehouse = warehouse; 
      });
    }
  }
  loadOrder(workOrderQcRuleConfiguration: WorkOrderQcRuleConfiguration){
    if (workOrderQcRuleConfiguration.outboundOrderId) {
 
      this.orderService
      .getOrder(workOrderQcRuleConfiguration.outboundOrderId)
      .subscribe((order: Order) => {

        workOrderQcRuleConfiguration.outboundOrder = order; 
      });
    }}
  loadCustomer(workOrderQcRuleConfiguration: WorkOrderQcRuleConfiguration){
    if (workOrderQcRuleConfiguration.customerId) {
 
      this.localCacheService
      .getCustomer(workOrderQcRuleConfiguration.customerId)
      .subscribe((customer: Customer) => {

        workOrderQcRuleConfiguration.customer = customer; 
      });
    }}
  loadItem(workOrderQcRuleConfiguration: WorkOrderQcRuleConfiguration){
    if (workOrderQcRuleConfiguration.itemId) {
 
      this.localCacheService
      .getItem(workOrderQcRuleConfiguration.itemId)
      .subscribe((item: Item) => {

        workOrderQcRuleConfiguration.item = item; 
      });
    }}
  loadItemFamily(workOrderQcRuleConfiguration: WorkOrderQcRuleConfiguration){
    if (workOrderQcRuleConfiguration.itemFamilyId) {
 
      this.localCacheService
      .getItemFamily(workOrderQcRuleConfiguration.itemFamilyId)
      .subscribe((itemFamily: ItemFamily) => {

        workOrderQcRuleConfiguration.itemFamily = itemFamily; 
      });
    }}
  loadInventoryStatus(workOrderQcRuleConfiguration: WorkOrderQcRuleConfiguration){
    if (workOrderQcRuleConfiguration.fromInventoryStatusId) {
 
      this.localCacheService
      .getInventoryStatus(workOrderQcRuleConfiguration.fromInventoryStatusId)
      .subscribe((inventoryStatus: InventoryStatus) => {

        workOrderQcRuleConfiguration.fromInventoryStatus = inventoryStatus; 
      });
    }
    if (workOrderQcRuleConfiguration.toInventoryStatusId) {
 
      this.localCacheService
      .getInventoryStatus(workOrderQcRuleConfiguration.toInventoryStatusId)
      .subscribe((inventoryStatus: InventoryStatus) => {

        workOrderQcRuleConfiguration.toInventoryStatus = inventoryStatus; 
      });
    }

  }
  loadInventoryLock(workOrderQcRuleConfiguration: WorkOrderQcRuleConfiguration){
    if (workOrderQcRuleConfiguration.inventoryLockId) {
 
      this.localCacheService
      .getInventoryLock(workOrderQcRuleConfiguration.inventoryLockId)
      .subscribe((inventoryLock: InventoryLock) => {

        workOrderQcRuleConfiguration.inventoryLock = inventoryLock; 
      });
    }
    if (workOrderQcRuleConfiguration.futureInventoryLockId) {
 
      this.localCacheService
      .getInventoryLock(workOrderQcRuleConfiguration.futureInventoryLockId)
      .subscribe((inventoryLock: InventoryLock) => {

        workOrderQcRuleConfiguration.futureInventoryLock = inventoryLock; 
      });
    }

  }

  loadAvailableInventoryStatus(): void {
    if (this.validInventoryStatuses.length === 0) {
      this.inventoryStatusService
        .loadInventoryStatuses()
        .subscribe(inventoryStatuses => (this.validInventoryStatuses = inventoryStatuses));
    }
  }
  loadProductionLines() {

    this.productionLineService.getProductionLines().subscribe(
    {
      next: (productionLineRes) => this.validproductionLines = productionLineRes 
    });

  }


  loadQCRules() {

    this.qcRuleService.getQCRules().subscribe({
      next: (qcRuleRes) =>  {
        this.allQCRules = qcRuleRes;
        this.qcRuleList = [];
        this.assignedQCRuleIds = [];
        this.allQCRules.forEach(qcRule => {
          const qcRuleAssigned = 
              this.currentQCRuleConfiguration!.workOrderQCRuleConfigurationRules!.some(workOrderQCRuleConfigurationRule => {
                
                return workOrderQCRuleConfigurationRule.qcRuleId === qcRule.id!
              }
          )
  
          this.qcRuleList.push({
            key: qcRule.id!.toString(),
            title: `${qcRule.name}`,
            description: `${qcRule.description}`,
            direction: qcRuleAssigned ? 'right' : undefined,
          });
        });
      }
    })
  }

  loadValidCustomers() {

    this.customerService.loadCustomers().subscribe({
      next: (customerRes) => this.validCustomers = customerRes
    });
  }

  loadValidInventoryLocks() {

    this.inventoryLockService.getInventoryLocks().subscribe({
      next: (inventoryLockRes) => this.validInventoryLocks = inventoryLockRes
    });
  }


  loadItemFamlies() {

    this.itemFamilyService.loadItemFamilies().subscribe(
    {
      next: (itemFamilyRes) => this.validItemFamilies = itemFamilyRes 
    });

  }
  customerNameChanged(customerName: string) {
  
    const matchedCustomer = this.validCustomers.find(customer => customer.name === customerName)
    if (matchedCustomer) {
      // clone a new customer structure so any further change won't 
      // mess up with the existing customers auto complete drop down list
      var clone = { ...matchedCustomer };
      this.currentQCRuleConfiguration!.customer = clone;
      this.currentQCRuleConfiguration!.customerId = clone.id!;
    }
  }

  lockNameChanged(lockName: string) {
  
    console.log(`lock is chagned to ${lockName}`)
    const matchedLock = this.validInventoryLocks.find(lock => lock.name === lockName)
    if (matchedLock) {
      // clone a new customer structure so any further change won't 
      // mess up with the existing customers auto complete drop down list
      var clone = { ...matchedLock };
      this.currentQCRuleConfiguration!.inventoryLock = clone;
      this.currentQCRuleConfiguration!.inventoryLockId = clone.id!;
    }

  }

  futureLockNameChanged(lockName: string) {
  
    console.log(`lock is chagned to ${lockName}`)
    const matchedLock = this.validInventoryLocks.find(lock => lock.name === lockName)
    if (matchedLock) {
      // clone a new customer structure so any further change won't 
      // mess up with the existing customers auto complete drop down list
      var clone = { ...matchedLock };
      this.currentQCRuleConfiguration!.futureInventoryLock = clone;
      this.currentQCRuleConfiguration!.futureInventoryLockId = clone.id!;
    }

  }


  orderNumberChanged(event: Event) { 
    const orderNumber = (event.target as HTMLInputElement).value.trim();
    if (orderNumber.length > 0) {

      this.orderService.getOrders(orderNumber, false).subscribe(
        {
          next: (orderRes) => {
            if (orderRes.length === 1) {
              console.log(`order is changed to ${orderRes[0].number}`);
              this.currentQCRuleConfiguration.outboundOrder = orderRes[0];
              this.currentQCRuleConfiguration.outboundOrderId = orderRes[0].id!;
            }
          }
        }
      )
    }
  }
  itemNameChanged(event: Event) {
    const itemName = (event.target as HTMLInputElement).value.trim();
    if (itemName.length > 0) {

      this.itemService.getItems(itemName).subscribe(
        {
          next: (itemsRes) => {
            if (itemsRes.length === 1) {
              console.log(`item is changed to ${itemsRes[0].name}`);
              this.currentQCRuleConfiguration.item = itemsRes[0];
              this.currentQCRuleConfiguration.itemId = itemsRes[0].id!;
            }
          }
        }
      )
    }
  }
  warehouseChanged(id: number) {
    
    this.currentQCRuleConfiguration.warehouseId = id;
    
    this.currentQCRuleConfiguration.warehouse = 
      this.warehouses.find(
        warehouse => warehouse.id === id
      );

      
  }
  itemFamilyChanged(id: number) {
    
    this.currentQCRuleConfiguration.itemFamilyId = id;
    
    this.currentQCRuleConfiguration.itemFamily = 
      this.validItemFamilies.find(
        itemFamily => itemFamily.id === id
      );

      
  }
  fromInventoryStatusChanged(id: number) { 
    this.currentQCRuleConfiguration.fromInventoryStatusId = id;
    this.validInventoryStatuses
      .filter(inventoryStatus => inventoryStatus.id == this.currentQCRuleConfiguration.fromInventoryStatusId)
      .forEach(inventoryStatus => {
        this.currentQCRuleConfiguration.fromInventoryStatus = inventoryStatus;
      });
    console.log(`currentQCRuleConfiguration's FROM status is changed to ${this.currentQCRuleConfiguration.fromInventoryStatus?.name}`);
  }
  toInventoryStatusChanged(id: number) { 
    this.currentQCRuleConfiguration.toInventoryStatusId = id;
    this.validInventoryStatuses
      .filter(inventoryStatus => inventoryStatus.id == this.currentQCRuleConfiguration.toInventoryStatusId)
      .forEach(inventoryStatus => {
        this.currentQCRuleConfiguration.toInventoryStatus = inventoryStatus;
      });
    console.log(`currentQCRuleConfiguration's TO status is changed to ${this.currentQCRuleConfiguration.toInventoryStatus?.name}`);
  }


  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;

  }

  confirm(): void {
    this.isSpinning = true;
    
    if (this.newQCRuleConfiguration) {

      this.workOrderQcRuleConfigurationService.addQCRuleConfiguration(this.currentQCRuleConfiguration)
        .subscribe({
          next: () => {
            this.messageService.success(this.i18n.fanyi('message.save.complete'));
            setTimeout(() => {
              this.isSpinning = false;
              this.router.navigateByUrl(`/work-order/qc-rule-configuration`);
            }, 500);
          },
          error: () => this.isSpinning = false


        }); 
    }
    else {
      

      this.workOrderQcRuleConfigurationService.changeQCRuleConfiguration(this.currentQCRuleConfiguration)
        .subscribe({
          next: () => {
            this.messageService.success(this.i18n.fanyi('message.save.complete'));
            setTimeout(() => {
              this.isSpinning = false;
              this.router.navigateByUrl(`/work-order/qc-rule-configuration`);
            }, 500);
          },
          error: () => this.isSpinning = false


        }); 
        
    }
  }

  
  processItemQueryResult(selectedItemName: any): void {
    console.log(`start to query with item name ${selectedItemName}`);
    this.itemService.getItems(selectedItemName).subscribe(
      {
        next: (itemsRes) => {
          if (itemsRes.length === 1) {
            this.currentQCRuleConfiguration.item = itemsRes[0];
            this.currentQCRuleConfiguration.itemId = itemsRes[0].id!;
          }
        }
      }
    )
    
  }

  productionLineChanged(id: number) {
    console.log(`production line is changed to id ${id}`);
    
    this.currentQCRuleConfiguration.productionLine =
        this.validproductionLines.find(
          productionLine => productionLine.id === id
        );
  }
  
  wrokOrderChanged(event: Event) {
    const workOrderNumber = (event.target as HTMLInputElement).value.trim();
    if (workOrderNumber.length > 0) {

      this.workOrderService.getWorkOrders(workOrderNumber).subscribe(
        {
          next: (workOrderRes) => {
            if (workOrderRes.length === 1) {
              console.log(`workOrder is changed to ${workOrderRes[0].number}`);
              this.currentQCRuleConfiguration.workOrder = workOrderRes[0]; 
            }
          }
        }
      )
    }
  }
  
  transferListFilterOption(inputValue: string, item: any): boolean {
    return item.title.indexOf(inputValue) > -1;
  }

  transferListSearch(ret: {}): void {
    console.log('nzSearchChange', ret);
  }

  transferListSelect(ret: {}): void {
    console.log('nzSelectChange', ret);
  }

  transferListChange(ret: TransferChange): void {
    console.log('nzChange', ret);
    const listKeys = ret.list.map(l => l['key']);
    console.log('listKeys', JSON.stringify(listKeys));

    if (ret.from === 'left' && ret.to === 'right') {
      // assign the qc rule 
      const qcRules: WorkOrderQcRuleConfigurationRule[] = this.allQCRules.filter(
        qcRule => listKeys.some(key => qcRule.id === +key)
      ).map(
        qcRule => {
          return {
            qcRuleId: qcRule.id,
            qcRule: qcRule,
          }
        }
      )
      this.currentQCRuleConfiguration.workOrderQCRuleConfigurationRules = [
        ...this.currentQCRuleConfiguration.workOrderQCRuleConfigurationRules, ...qcRules
      ];
    }
    else if (ret.from === 'right' && ret.to === 'left') {      
      this.currentQCRuleConfiguration.workOrderQCRuleConfigurationRules =  
          this.currentQCRuleConfiguration.workOrderQCRuleConfigurationRules.filter(
            workOrderQCRuleConfigurationRules => listKeys.some(key => workOrderQCRuleConfigurationRules.qcRule!.id === +key) === false
          ) 
    }
    console.log(`this.currentQCRuleConfiguration.workOrderQCRuleConfigurationRules.length: \n ${JSON.stringify(this.currentQCRuleConfiguration.workOrderQCRuleConfigurationRules.length)}`);
    this.currentQCRuleConfiguration.workOrderQCRuleConfigurationRules.forEach(
      assignedQCRule => console.log(`assigned qc rule id: ${assignedQCRule.qcRule?.id} / ${assignedQCRule.qcRule?.name}`)
    )
  }

  
  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [

    { title: this.i18n.fanyi("name"), index: 'qcRule.name',   },
    { title: this.i18n.fanyi("description"), index: 'qcRule.description',  }, 

  ];
}
