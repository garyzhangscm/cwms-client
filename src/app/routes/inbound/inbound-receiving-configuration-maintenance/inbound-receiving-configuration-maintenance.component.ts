import { Component, Inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Supplier } from '../../common/models/supplier';
import { SupplierService } from '../../common/services/supplier.service';
import { ItemFamily } from '../../inventory/models/item-family';
import { ItemFamilyService } from '../../inventory/services/item-family.service';
import { ItemService } from '../../inventory/services/item.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { InboundReceivingConfiguration } from '../models/inbound-receiving-configuration';
import { ReceiptStatus } from '../models/receipt-status.enum';
import { InboundReceivingConfigurationService } from '../services/inbound-receiving-configuration.service';

@Component({
    selector: 'app-inbound-inbound-receiving-configuration-maintenance',
    templateUrl: './inbound-receiving-configuration-maintenance.component.html',
    standalone: false
})
export class InboundInboundReceivingConfigurationMaintenanceComponent implements OnInit {

  currentInboundReceivingConfiguration!: InboundReceivingConfiguration;
  stepIndex = 0;
  pageTitle: string = "";
  newInboundReceivingConfiguration = true;
  isSpinning = false;
  validSuppliers: Supplier[] = [];
  warehouseSpecific = false;
  
  validItemFamilies: ItemFamily[] = []; 

  receiptStatusList = ReceiptStatus


  constructor(private http: _HttpClient,
    private companyService: CompanyService,
    private inboundReceivingConfigurationService: InboundReceivingConfigurationService,
    private messageService: NzMessageService,
    private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private warehouseService: WarehouseService,
    private itemService: ItemService,
    private supplierService: SupplierService,
    private itemFamilyService: ItemFamilyService,  
    private activatedRoute: ActivatedRoute) {
    this.pageTitle = this.i18n.fanyi('inbound-receiving-configuration');

    this.currentInboundReceivingConfiguration = this.createEmptyInboundReceivingConfiguration();
  }

  createEmptyInboundReceivingConfiguration(): InboundReceivingConfiguration {
    return { 
      companyId: this.companyService.getCurrentCompany()!.id,      
      standardPalletSize: 0,
      estimatePalletCountBySize: false,
      estimatePalletCountByReceiptLineCubicMeter: false,
    }
  }


  ngOnInit(): void {


    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        // Get the production line by ID
        this.inboundReceivingConfigurationService.getInboundReceivingConfiguration(params.id)
          .subscribe(inboundReceivingConfiguration => {
            this.currentInboundReceivingConfiguration = inboundReceivingConfiguration;

            this.newInboundReceivingConfiguration = false;
            if (inboundReceivingConfiguration.warehouseId) {

              this.warehouseSpecific = true;
            }
          });
      }
      else {
        // this.currentProductionLine = this.createEmptyProductionLine(); 
        this.newInboundReceivingConfiguration = true;
      }
    });
    this.loadSuppliers();

     
    this.loadItemFamlies();

  }
    
  loadItemFamlies() {

    this.itemFamilyService.loadItemFamilies().subscribe(
    {
      next: (itemFamilyRes) => this.validItemFamilies = itemFamilyRes 
    });

  } 

  loadSuppliers() {

    this.supplierService.loadSuppliers().subscribe(
      {
        next: (supplierRes) => this.validSuppliers = supplierRes 
      }
    );

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
      this.currentInboundReceivingConfiguration.warehouseId = this.warehouseService.getCurrentWarehouse().id;
    }
    else {
      this.currentInboundReceivingConfiguration.warehouseId = undefined;
    }
    if (this.newInboundReceivingConfiguration) {

      this.inboundReceivingConfigurationService.addInboundReceivingConfiguration(this.currentInboundReceivingConfiguration)
        .subscribe({
          next: () => {
            this.messageService.success(this.i18n.fanyi('message.save.complete'));
            setTimeout(() => {
              this.isSpinning = false;
              this.router.navigateByUrl(`/inbound/inbound-receiving-configuration`);
            }, 500);
          },
          error: () => this.isSpinning = false


        }); 
    }
    else {
      

      this.inboundReceivingConfigurationService.changeInboundReceivingConfiguration(this.currentInboundReceivingConfiguration)
        .subscribe({
          next: () => {
            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi('message.save.complete'));
            setTimeout(() => {
              this.router.navigateByUrl(`/inbound/inbound-receiving-configuration`);
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
        this.currentInboundReceivingConfiguration.supplier = supplierRes;
        this.currentInboundReceivingConfiguration.supplierId = supplierRes.id;
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
              this.currentInboundReceivingConfiguration.item = itemsRes[0];
              this.currentInboundReceivingConfiguration.itemId = itemsRes[0].id!;
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
            this.currentInboundReceivingConfiguration.item = itemsRes[0];
            this.currentInboundReceivingConfiguration.itemId = itemsRes[0].id!;
          }
        }
      }
    )
    
  } 
  
  itemFamilyChanged(id: number) {
    
    this.currentInboundReceivingConfiguration.itemFamilyId = id;
    
    this.currentInboundReceivingConfiguration.itemFamily = 
      this.validItemFamilies.find(
        itemFamily => itemFamily.id === id
      );

      
  }

}
