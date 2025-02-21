import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { Inventory } from '../models/inventory';
import { InventoryConfiguration } from '../models/inventory-configuration';
import { InventoryStatus } from '../models/inventory-status';
import { InventoryConfigurationService } from '../services/inventory-configuration.service';
import { InventoryStatusService } from '../services/inventory-status.service';
import { InventoryService } from '../services/inventory.service';

@Component({
    selector: 'app-inventory-inventory-attribute-change',
    templateUrl: './inventory-attribute-change.component.html',
    standalone: false
})
export class InventoryInventoryAttributeChangeComponent implements OnInit {
  currentInventory!: Inventory;
  pageTitle: string;
  availableInventoryStatuses: InventoryStatus[] = [];
  inventoryConfiguration?: InventoryConfiguration;
  
  constructor(
    private activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private inventoryService: InventoryService,
    private inventoryStatusService: InventoryStatusService,
    private inventoryConfigurationService: InventoryConfigurationService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.inventory.attributeChange.header.title');
    
    inventoryConfigurationService.getInventoryConfigurations().subscribe({
      next: (inventoryConfigurationRes) => {
        if (inventoryConfigurationRes) { 
          this.inventoryConfiguration = inventoryConfigurationRes;
        }  
      } ,  
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.inventory.attributeChange.header.title'));
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.inprocess === 'true') {
        this.currentInventory = JSON.parse(sessionStorage.getItem('inventory-attribute-change.inventory')!);
      } else {
        this.inventoryService.getInventoryById(params.id).subscribe(inventory => {
          this.currentInventory = inventory;
        });
      }
    });
    this.inventoryStatusService
      .loadInventoryStatuses()
      .subscribe(inventoryStatuses => (this.availableInventoryStatuses = inventoryStatuses));
  }

  saveCurrentInventory(): void {
    sessionStorage.setItem('inventory-attribute-change.inventory', JSON.stringify(this.currentInventory));
  }

  itemPackageTypeChange(newItemPackageTypeName: string): void {
    const itemPackageTypes = this.currentInventory.item!.itemPackageTypes.filter(
      itemPackageType => itemPackageType.name === newItemPackageTypeName,
    );
    if (itemPackageTypes.length === 1) {
      this.currentInventory.itemPackageType = itemPackageTypes[0];
    }
  }
  inventoryStatusChange(newInventoryStatusName: string): void {
    this.availableInventoryStatuses.forEach(inventoryStatus => {
      if (inventoryStatus.name === newInventoryStatusName) {
        this.currentInventory.inventoryStatus = inventoryStatus;
      }
    });
  }
}
