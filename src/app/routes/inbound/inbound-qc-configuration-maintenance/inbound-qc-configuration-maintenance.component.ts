import { Component, Inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Supplier } from '../../common/models/supplier';
import { SupplierService } from '../../common/services/supplier.service';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { ItemFamily } from '../../inventory/models/item-family';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ItemFamilyService } from '../../inventory/services/item-family.service';
import { ItemService } from '../../inventory/services/item.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { InboundQcConfiguration } from '../models/inbound-qc-configuration';
import { InboundQcConfigurationService } from '../services/inbound-qc-configuration.service';

@Component({
    selector: 'app-inbound-inbound-qc-configuration-maintenance',
    templateUrl: './inbound-qc-configuration-maintenance.component.html',
    styleUrls: ['./inbound-qc-configuration-maintenance.component.less'],
    standalone: false
})
export class InboundInboundQcConfigurationMaintenanceComponent implements OnInit {

  currentQCConfiguration!: InboundQcConfiguration;
  stepIndex = 0;
  pageTitle: string = "";
  newQCConfiguration = true;
  isSpinning = false;
  validSuppliers: Supplier[] = [];
  warehouseSpecific = false;
  
  validItemFamilies: ItemFamily[] = [];
  validInventoryStatuses: InventoryStatus[] = [];


  constructor(private http: _HttpClient,
    private companyService: CompanyService,
    private inboundQCConfigurationService: InboundQcConfigurationService,
    private messageService: NzMessageService,
    private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private warehouseService: WarehouseService,
    private itemService: ItemService,
    private supplierService: SupplierService,
    private itemFamilyService: ItemFamilyService, 
    private inventoryStatusService: InventoryStatusService, 
    private activatedRoute: ActivatedRoute) {
    this.pageTitle = this.i18n.fanyi('menu.main.inbound.qc-configuration');

    this.currentQCConfiguration = this.createEmptyQcConfiguration();
  }

  createEmptyQcConfiguration(): InboundQcConfiguration {
    return { 
      companyId: this.companyService.getCurrentCompany()!.id,      
      qcQuantityPerReceipt: 0,
      qcPercentage: 0,
    }
  }


  ngOnInit(): void {


    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        // Get the production line by ID
        this.inboundQCConfigurationService.getInboundQcConfiguration(params.id)
          .subscribe(qcConfiguration => {
            this.currentQCConfiguration = qcConfiguration;

            this.newQCConfiguration = false;
            if (qcConfiguration.warehouseId) {

              this.warehouseSpecific = true;
            }
          });
      }
      else {
        // this.currentProductionLine = this.createEmptyProductionLine(); 
        this.newQCConfiguration = true;
      }
    });
    this.loadSuppliers();

    
    this.loadAvailableInventoryStatus();
    this.loadItemFamlies();

  }
    
  loadItemFamlies() {

    this.itemFamilyService.loadItemFamilies().subscribe(
    {
      next: (itemFamilyRes) => this.validItemFamilies = itemFamilyRes 
    });

  }
  loadAvailableInventoryStatus(): void {
    if (this.validInventoryStatuses.length === 0) {
      this.inventoryStatusService
        .loadInventoryStatuses()
        .subscribe(inventoryStatuses => (this.validInventoryStatuses = inventoryStatuses));
    }
  }

  loadSuppliers() {

    this.supplierService.loadSuppliers().subscribe(
      {
        next: (supplierRes) => this.validSuppliers = supplierRes 
      }
    );

  }
  fromInventoryStatusChanged(id: number) { 
    this.currentQCConfiguration.fromInventoryStatusId = id;
    this.validInventoryStatuses
      .filter(inventoryStatus => inventoryStatus.id == this.currentQCConfiguration.fromInventoryStatusId)
      .forEach(inventoryStatus => {
        this.currentQCConfiguration.fromInventoryStatus = inventoryStatus;
      });
    console.log(`currentQCConfiguration's FROM status is changed to ${this.currentQCConfiguration.fromInventoryStatus?.name}`);
  }
  toInventoryStatusChanged(id: number) { 
    this.currentQCConfiguration.toInventoryStatusId = id;
    this.validInventoryStatuses
      .filter(inventoryStatus => inventoryStatus.id == this.currentQCConfiguration.toInventoryStatusId)
      .forEach(inventoryStatus => {
        this.currentQCConfiguration.toInventoryStatus = inventoryStatus;
      });
    console.log(`currentQCConfiguration's TO status is changed to ${this.currentQCConfiguration.toInventoryStatus?.name}`);
  }

  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;

  }

  confirm(): void {
    this.isSpinning = true;
    if (this.warehouseSpecific) {
      this.currentQCConfiguration.warehouseId = this.warehouseService.getCurrentWarehouse().id;
    }
    else {
      this.currentQCConfiguration.warehouseId = undefined;
    }
    if (this.newQCConfiguration) {

      this.inboundQCConfigurationService.addInboundQcConfiguration(this.currentQCConfiguration)
        .subscribe({
          next: () => {
            this.messageService.success(this.i18n.fanyi('message.save.complete'));
            setTimeout(() => {
              this.isSpinning = false;
              this.router.navigateByUrl(`/inbound/inbound-qc-configuration`);
            }, 500);
          },
          error: () => this.isSpinning = false


        }); 
    }
    else {
      

      this.inboundQCConfigurationService.changeInboundQcConfiguration(this.currentQCConfiguration)
        .subscribe({
          next: () => {
            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi('message.save.complete'));
            setTimeout(() => {
              this.router.navigateByUrl(`/inbound/inbound-qc-configuration`);
            }, 500);
          },
          error: () => this.isSpinning = false


        }); 
        
    }
  }

  supplierChanged(id: number) {
    console.log(`supplier is changed to id ${id}`);
    this.supplierService.getSupplier(id).subscribe({

      next: (supplierRes) => {
        console.log(`supplier is changed to ${supplierRes.name}`);
        this.currentQCConfiguration.supplier = supplierRes;
        this.currentQCConfiguration.supplierId = supplierRes.id;
      }

    })
  }
  
  itemNameChanged(event: Event) {
    const itemName = (event.target as HTMLInputElement).value.trim();
    if (itemName.length > 0) {

      this.itemService.getItems(itemName).subscribe(
        {
          next: (itemsRes) => {
            if (itemsRes.length === 1) {
              console.log(`item is changed to ${itemsRes[0].name}`);
              this.currentQCConfiguration.item = itemsRes[0];
              this.currentQCConfiguration.itemId = itemsRes[0].id!;
            }
          }
        }
      )
    }
  }
  

  processItemQueryResult(selectedItemName: any): void {
    console.log(`start to query with item name ${selectedItemName}`);
    this.itemService.getItems(selectedItemName).subscribe(
      {
        next: (itemsRes) => {
          if (itemsRes.length === 1) {
            this.currentQCConfiguration.item = itemsRes[0];
            this.currentQCConfiguration.itemId = itemsRes[0].id!;
          }
        }
      }
    )
    
  }
  readyForConfirm() : boolean{

    // we have to have at lease
    // 1. either qc quantity or qc percentage defined
    // 2. to inventory status is defined
    return ((this.currentQCConfiguration.qcPercentage !== undefined &&
              this.currentQCConfiguration.qcPercentage > 0) ||
              (this.currentQCConfiguration.qcQuantityPerReceipt  !== undefined &&
                this.currentQCConfiguration.qcQuantityPerReceipt > 0)) &&
                this.currentQCConfiguration.toInventoryStatusId  !== undefined;

  }
  
  itemFamilyChanged(id: number) {
    
    this.currentQCConfiguration.itemFamilyId = id;
    
    this.currentQCConfiguration.itemFamily = 
      this.validItemFamilies.find(
        itemFamily => itemFamily.id === id
      );

      
  }
  
}
