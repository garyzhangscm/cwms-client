import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Inventory } from '../models/inventory';
import { InventoryConfiguration } from '../models/inventory-configuration'; 
import { InventoryConfigurationService } from '../services/inventory-configuration.service';
import { InventoryService } from '../services/inventory.service';

@Component({
    selector: 'app-inventory-inventory-attribute-change-confirm',
    templateUrl: './inventory-attribute-change-confirm.component.html',
    standalone: false
})
export class InventoryInventoryAttributeChangeConfirmComponent implements OnInit {
  currentInventory!: Inventory;
  pageTitle: string;

  isSpinning = false;

  originalInventoryItemPackageTypeName = '';
  originalInventoryStatusName = '';
  
  originalInventoryColor : string | undefined = '';
  originalInventoryStyle : string | undefined = '';
  originalInventoryProductSize : string | undefined = '';
  originalInventoryAttribute1 : string | undefined= '';
  originalInventoryAttribute2 : string | undefined = '';
  originalInventoryAttribute3 : string | undefined = '';
  originalInventoryAttribute4 : string | undefined = '';
  originalInventoryAttribute5 : string | undefined = '';
  
  originalInWarehouseDatetime : Date | undefined;
  
  inventoryConfiguration?: InventoryConfiguration;

  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private inventoryService: InventoryService,
    private inventoryConfigurationService: InventoryConfigurationService,
    private messageService: NzMessageService,
    private router: Router,
  ) {
    this.pageTitle = this.i18n.fanyi('page.inventory.attributeChange.confirm.title');
    
    inventoryConfigurationService.getInventoryConfigurations().subscribe({
      next: (inventoryConfigurationRes) => {
        if (inventoryConfigurationRes) { 
          this.inventoryConfiguration = inventoryConfigurationRes;
        }  
      } ,  
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.inventory.attributeChange.confirm.title'));
    this.currentInventory = JSON.parse(sessionStorage.getItem('inventory-attribute-change.inventory')!);

    // Assume we will process one LPN at a time
    this.inventoryService.getInventoryById(this.currentInventory.id!).subscribe(inventory => {
      this.originalInventoryItemPackageTypeName = inventory.itemPackageType!.name!;
      this.originalInventoryStatusName = inventory.inventoryStatus!.name;

      
      this.originalInventoryColor = inventory.color;
      this.originalInventoryStyle = inventory.style;
      this.originalInventoryProductSize = inventory.productSize;
      this.originalInventoryAttribute1 = inventory.attribute1;
      this.originalInventoryAttribute2 = inventory.attribute2;
      this.originalInventoryAttribute3 = inventory.attribute3;
      this.originalInventoryAttribute4 = inventory.attribute4;
      this.originalInventoryAttribute5 = inventory.attribute5; 

      this.originalInWarehouseDatetime = inventory.inWarehouseDatetime;
    });
  }

  saveCurrentInventory(): void {
    this.isSpinning = true;

    this.inventoryService
    .changeInventory(this.currentInventory)
    .subscribe({
      next: (inventoryRes) => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.isSpinning = false;
        this.router.navigateByUrl(`/inventory/inventory?id=${inventoryRes.id}&refresh=true`);
      }, 
      error: () => this.isSpinning = false
    }); 
    
  }
}
