import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { STChange, STColumn, STComponent } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

import { UserService } from '../../auth/services/user.service';
import { PickWork } from '../../outbound/models/pick-work';
import { PickService } from '../../outbound/services/pick.service';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { Inventory } from '../models/inventory';
import { InventoryAllocationSummary } from '../models/inventory-allocation-summary';
import { InventoryAllocationSummaryService } from '../services/inventory-allocation-summary.service';
import { InventoryService } from '../services/inventory.service';

@Component({
  selector: 'app-inventory-inventory-allocation-summary',
  templateUrl: './inventory-allocation-summary.component.html',
  styleUrls: ['./inventory-allocation-summary.component.less'],
})
export class InventoryInventoryAllocationSummaryComponent implements OnInit {

  searchForm!: UntypedFormGroup;
  listOfAllInventoryAllocationSummary: InventoryAllocationSummary[] = [];
  mapOfInventory: { [key: string]: Inventory[] } = {};
  mapOfPicks: { [key: string]: PickWork[] } = {};
  mapOfAllocatedQuantity: { [key: string]: boolean } = {}; 
  isSpinning = false;
  isSpinningAtInventoryTab = false;
  isSpinningAtPickTab = false;
  searchResult = '';
  
  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [  
    {
      title: this.i18n.fanyi("location"),
      // renderTitle: 'customTitle',
      render: 'locationColumn',
      iif: () => this.isChoose('location') 
    }, 
    { title: this.i18n.fanyi("item"), index: 'item.name', iif: () => this.isChoose('itemName')},
    { title: this.i18n.fanyi("description"), index: 'item.description', iif: () => this.isChoose('itemDescription')},
    { title: this.i18n.fanyi("inventory.status"), index: 'inventoryStatus.description', iif: () => this.isChoose('inventoryStatus')},
    { title: this.i18n.fanyi("total-quantity"), index: 'totalQuantity', iif: () => this.isChoose('totalQuantity')  },    
    // { title: this.i18n.fanyi("allocated-quantity"), index: 'allocatedQuantity', iif: () => this.isChoose('allocatedQuantity')  },
    // { title: this.i18n.fanyi("available-quantity"), index: 'availableQuantity', iif: () => this.isChoose('availableQuantity')  },
    
    {
      title: this.i18n.fanyi("allocated-quantity"),
      // renderTitle: 'customTitle',
      render: 'allocatedQuantityColumn',
      iif: () => this.isChoose('allocatedQuantity') 
    }, 
    
    {
      title: this.i18n.fanyi("available-quantity"),
      // renderTitle: 'customTitle',
      render: 'availableQuantityColumn',
      iif: () => this.isChoose('availableQuantity') 
    }, 
   
  ];
  customColumns = [

    { label: this.i18n.fanyi("location"), value: 'location', checked: true },
    { label: this.i18n.fanyi("item"), value: 'itemName', checked: true },
    { label: this.i18n.fanyi("description"), value: 'itemDescription', checked: true },
    { label: this.i18n.fanyi("inventory.status"), value: 'inventoryStatus', checked: true },
    
    { label: this.i18n.fanyi("total-quantity"), value: 'totalQuantity', checked: true },
    { label: this.i18n.fanyi("allocated-quantity"), value: 'allocatedQuantity', checked: true },
    { label: this.i18n.fanyi("available-quantity"), value: 'availableQuantity', checked: true },
  ];


  displayOnly = false;
  constructor(private http: _HttpClient, 
    private fb: UntypedFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private pickService: PickService,
    private inventoryService: InventoryService,
    private localCacheService: LocalCacheService,
    private userService: UserService,
    private inventoryAllocationSummaryService: InventoryAllocationSummaryService) {
      userService.isCurrentPageDisplayOnly("/inventory/inventory-allocation-summary").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                            
    
    }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.order'));
    // initiate the search form
    this.searchForm = this.fb.group({
      itemName: [null],
      location: [null],
    });
}

  
  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllInventoryAllocationSummary = [];
    this.mapOfInventory = {};
    this.mapOfPicks = {};

  }


  processItemQueryResult(selectedItemName: any): void { 
    this.searchForm.controls.itemName.setValue(selectedItemName);
  }
  processLocationQueryResult(selectedLocationName: any): void { 
    this.searchForm.controls.location.setValue(selectedLocationName);
  }

  
  search(): void {
    this.isSpinning = true;
    this.searchResult = '';
    this.inventoryAllocationSummaryService.getInventoryAllocationSummary(
      undefined,
      this.searchForm.controls.itemName.value, 
      undefined,
      this.searchForm.controls.location.value).subscribe({

        next: (inventoryAllocationSummaryRes) => {

          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: inventoryAllocationSummaryRes.length,
          });
          
          this.listOfAllInventoryAllocationSummary = inventoryAllocationSummaryRes;
          this.listOfAllInventoryAllocationSummary.forEach(
            inventoryAllocationSummary => {
              // set the indicator to false so that we won't show
              // the allocated quantity and the available quantity before we actually loaded the right quantity
              this.mapOfAllocatedQuantity[`${inventoryAllocationSummary.locationId}|${inventoryAllocationSummary.item.id}|${inventoryAllocationSummary.inventoryStatus.id}`]
                  = false;
              this.loadAllocatedAndAvailableQuantity(inventoryAllocationSummary);
              this.loadLocationInformation(inventoryAllocationSummary);
            }
          )
        }, 
        error: () => this.isSpinning = false
      });  
  }

  
  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.st !== undefined && this.st.columns !== undefined) {
      this.st!.resetColumns({ emitReload: true });

    }
  }

  inventoryAllocationSummaryTableChanged(event: STChange) : void { 
    if (event.type === 'expand' && event.expand.expand === true) {
      
      this.showInventoryAllocationSummaryDetails(event.expand);
    }

  }
  
  showInventoryAllocationSummaryDetails(inventoryAllocationSummary: InventoryAllocationSummary): void { 
      this.showPicks(inventoryAllocationSummary);
      this.showInventory(inventoryAllocationSummary);  
  }
  showPicks(inventoryAllocationSummary: InventoryAllocationSummary): void {
    this.isSpinningAtPickTab = true;
    this.pickService.getOpenPicksBySourceLocationIdAndItemId(
      inventoryAllocationSummary.item.id!, inventoryAllocationSummary.locationId).subscribe(
        {
          next: (pickRes) => {
            this.mapOfPicks[`${inventoryAllocationSummary.locationId}|${inventoryAllocationSummary.item.id}|${inventoryAllocationSummary.inventoryStatus.id}`] = [...pickRes];
            
            this.isSpinningAtPickTab = false;
          }, 
          error: () =>  this.isSpinningAtPickTab = false

        }
      );
  }
  showInventory(inventoryAllocationSummary: InventoryAllocationSummary): void {
    this.isSpinningAtInventoryTab = true;
    this.inventoryService.getInventoriesByLocationNameAndItemNameAndInventoryStatusId(
      inventoryAllocationSummary.locationId,
      inventoryAllocationSummary.item.name,
      inventoryAllocationSummary.inventoryStatus.id!).subscribe(
        
        {
          next: (inventoryRes) => {
            this.mapOfInventory[`${inventoryAllocationSummary.locationId}|${inventoryAllocationSummary.item.id}|${inventoryAllocationSummary.inventoryStatus.id}`] = [...inventoryRes];
            
            this.isSpinningAtInventoryTab = false;
          }, 
          error: () =>  this.isSpinningAtInventoryTab = false
        }
      );
  }

  loadLocationInformation(inventoryAllocationSummary: InventoryAllocationSummary): void {

    if (inventoryAllocationSummary.location == null) {

      this.localCacheService.getLocation(inventoryAllocationSummary.locationId).subscribe({

        next: (locationRes) => inventoryAllocationSummary.location = locationRes
      })
    }
  }
  loadAllocatedAndAvailableQuantity(inventoryAllocationSummary: InventoryAllocationSummary): void {
    this.pickService.getOpenPicksBySourceLocationIdAndItemId(
      inventoryAllocationSummary.item.id!, inventoryAllocationSummary.locationId).subscribe(
        {
          next: (pickRes) => {
            inventoryAllocationSummary.allocatedQuantity =  pickRes.map(pick => pick.quantity- pick.pickedQuantity).reduce((acc, cur) => acc + cur, 0);
            
            inventoryAllocationSummary.availableQuantity = inventoryAllocationSummary.totalQuantity - inventoryAllocationSummary.allocatedQuantity;
            this.mapOfAllocatedQuantity[`${inventoryAllocationSummary.locationId}|${inventoryAllocationSummary.item.id}|${inventoryAllocationSummary.inventoryStatus.id}`]
               = true;
            this.st.reload();  
            
          }
        }
      );
  }

}
