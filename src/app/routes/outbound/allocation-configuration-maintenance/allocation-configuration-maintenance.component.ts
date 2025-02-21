import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UnitOfMeasure } from '../../common/models/unit-of-measure';
import { UnitOfMeasureService } from '../../common/services/unit-of-measure.service';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { ItemFamily } from '../../inventory/models/item-family';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ItemFamilyService } from '../../inventory/services/item-family.service';
import { ItemService } from '../../inventory/services/item.service';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { LocationGroupType } from '../../warehouse-layout/models/location-group-type';
import { LocationGroupTypeService } from '../../warehouse-layout/services/location-group-type.service';
import { LocationGroupService } from '../../warehouse-layout/services/location-group.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { AllocationConfiguration } from '../models/allocation-configuration';
import { AllocationConfigurationType } from '../models/allocation-configuration-type.enum'; 
import { AllocationConfigurationService } from '../services/allocation-configuration.service';

@Component({
    selector: 'app-outbound-allocation-configuration-maintenance',
    templateUrl: './allocation-configuration-maintenance.component.html',
    standalone: false
})
export class OutboundAllocationConfigurationMaintenanceComponent implements OnInit {
 
  currentAllocationConfiguration!: AllocationConfiguration;
  allocationConfigurationTypes = AllocationConfigurationType;
  validItemFamilies: ItemFamily[] = [];
  validInventoryStatus: InventoryStatus[] = [];
  validLocationGroupTypes: LocationGroupType[] = [];
  validLocationGroups: LocationGroup[] = [];
  validUnitOfMeasures: UnitOfMeasure[] = [];
  selectedPickableUnitOfMeasures: UnitOfMeasure[] = [];

   
  stepIndex = 0;
  pageTitle: string = "";
  newAllocationConfiguration = true;
  isSpinning = false; 


  constructor(private http: _HttpClient, 
    private allocationConfigurationService: AllocationConfigurationService,
    private messageService: NzMessageService,
    private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private warehouseService: WarehouseService,
    private itemService: ItemService, 
    private itemFamilyService: ItemFamilyService, 
    private inventoryStatusService: InventoryStatusService,  
    private locationGroupTypeService: LocationGroupTypeService,  
    private locationGroupService: LocationGroupService,  
    private locationService: LocationService,
    private unitOfMeasureService: UnitOfMeasureService,
    private activatedRoute: ActivatedRoute) {
    this.pageTitle = this.i18n.fanyi('menu.main.outbound.allocation-configuration-maintenance');

    this.currentAllocationConfiguration = this.createEmptyCurrentAllocationConfiguration();
  }

  createEmptyCurrentAllocationConfiguration(): AllocationConfiguration {
    return {  
      warehouseId: this.warehouseService.getCurrentWarehouse().id, 
    }
  }


  ngOnInit(): void {


    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) { 
        this.isSpinning = true;
        this.allocationConfigurationService.getAllocationConfiguration(params.id)
          .subscribe(
          {

            next: (allocationConfiguration) => {
              this.currentAllocationConfiguration = allocationConfiguration;

              this.newAllocationConfiguration = false;
              this.selectedPickableUnitOfMeasures=[];
              this.currentAllocationConfiguration.allocationConfigurationPickableUnitOfMeasures?.forEach(
                pickableUnitOfMeasure => {
                  let matchedUnitOfMeasure = this.validUnitOfMeasures.find(
                    unitOfMeasure => unitOfMeasure.id === pickableUnitOfMeasure.unitOfMeasureId
                  );
                  if (matchedUnitOfMeasure) {
  
                    this.selectedPickableUnitOfMeasures = [...this.selectedPickableUnitOfMeasures, 
                      matchedUnitOfMeasure];
                  }
              });
              
              this.isSpinning = false;
            }, 
            error: () => {
              this.isSpinning = false;
            }

          })
          
      }
      else {
        
        this.selectedPickableUnitOfMeasures=[];
        this.newAllocationConfiguration = true;
      }
    }); 
    this.loadItemFamlies();
    
    this.loadInventoryStatus();

    this.loadLocationGroupTypes();
    this.loadLocationGroups();

    
    this.loadUnitOfMeasure();
    

}

loadItemFamlies() {

  this.itemFamilyService.loadItemFamilies().subscribe(
  {
    next: (itemFamilyRes) => this.validItemFamilies = itemFamilyRes 
  });

}
loadInventoryStatus() {
  
  this.inventoryStatusService.loadInventoryStatuses().subscribe(
    {
      next: (inventoryStatusRes) => this.validInventoryStatus = inventoryStatusRes 
    });
}

loadLocationGroupTypes() {

  this.locationGroupTypeService.loadLocationGroupTypes().subscribe(
  {
    next: (locationGroupTypeRes) => this.validLocationGroupTypes = locationGroupTypeRes 
  });

}
loadLocationGroups() {

  this.locationGroupService.loadLocationGroups().subscribe(
  {
    next: (locationGroupRes) => this.validLocationGroups = locationGroupRes 
  });

}
loadUnitOfMeasure() {

  this.unitOfMeasureService.loadUnitOfMeasures().subscribe(
  {
    next: (unitOfMeasureRes) => this.validUnitOfMeasures = unitOfMeasureRes 
  });

}

  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
    if (this.stepIndex == 1) {
      this.setupPickableUnitOfMeasure();
    }

  }

  setupPickableUnitOfMeasure() {
    if (!this.currentAllocationConfiguration.allocationConfigurationPickableUnitOfMeasures) {
      this.currentAllocationConfiguration.allocationConfigurationPickableUnitOfMeasures = [];
    }
    // add the unit of measure to the configuration, if it doesn't exists 
    // yet
    this.selectedPickableUnitOfMeasures.forEach(
      unitOfMeasure => {
        if (!this.currentAllocationConfiguration.allocationConfigurationPickableUnitOfMeasures!.some(
          pickableUnitOfMeasure => pickableUnitOfMeasure.unitOfMeasure.id === unitOfMeasure.id
        )) {
          this.currentAllocationConfiguration.allocationConfigurationPickableUnitOfMeasures = [
            ...this.currentAllocationConfiguration.allocationConfigurationPickableUnitOfMeasures!, 
            {
              
              unitOfMeasureId: unitOfMeasure.id!,
              unitOfMeasure: unitOfMeasure,
              warehouseId: this.warehouseService.getCurrentWarehouse().id,
              warehouse: this.warehouseService.getCurrentWarehouse()
            }

          ]

        }
      }
    );
    
    // remove the unit of measure to the configuration, if it  no long exists 
    this.currentAllocationConfiguration.allocationConfigurationPickableUnitOfMeasures = 
    this.currentAllocationConfiguration.allocationConfigurationPickableUnitOfMeasures.filter(
      pickableUnitOfMeasure => this.selectedPickableUnitOfMeasures.some(
        unitOfMeasure => unitOfMeasure.id === pickableUnitOfMeasure.unitOfMeasureId
      )
    );
  }
  confirm(): void {
    this.isSpinning = true;
    
    if (this.newAllocationConfiguration) {

      this.allocationConfigurationService.addAllocationConfiguration(this.currentAllocationConfiguration)
        .subscribe({
          next: (allocationConfigurationRes) => {
            this.messageService.success(this.i18n.fanyi('message.save.complete'));
            setTimeout(() => {
              this.isSpinning = false;
              this.router.navigateByUrl(`/outbound/allocation-configuration?sequence=${allocationConfigurationRes.sequence}`);
            }, 500);
          },
          error: () => this.isSpinning = false


        }); 
    }
    else {
      

      this.allocationConfigurationService.changeAllocationConfiguration(this.currentAllocationConfiguration)
        .subscribe({
          next: (allocationConfigurationRes) => { 
            this.messageService.success(this.i18n.fanyi('message.save.complete'));
            setTimeout(() => {
              this.isSpinning = false;
              this.router.navigateByUrl(`/outbound/allocation-configuration?sequence=${allocationConfigurationRes.sequence}`);
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
            this.currentAllocationConfiguration.item = itemsRes[0];
            this.currentAllocationConfiguration.itemId = itemsRes[0].id;
          }
        }
      }
    )
    
  }
  itemNameChanged(event: Event) {
    const itemName = (event.target as HTMLInputElement).value.trim();
    if (itemName.length > 0) {

      this.itemService.getItems(itemName).subscribe(
        {
          next: (itemsRes) => {
            if (itemsRes.length === 1) {
              console.log(`item is changed to ${itemsRes[0].name}`);
              this.currentAllocationConfiguration.item = itemsRes[0];
              this.currentAllocationConfiguration.itemId = itemsRes[0].id;
            }
          }
        }
      )
    }
  } 
    
  procesLocationQueryResult(selectedLocationName: any): void {
    console.log(`start to query with location name ${selectedLocationName}`);
    this.locationService.getLocations(undefined, undefined, selectedLocationName).subscribe(
      {
        next: (locationRes) => {
          if (locationRes.length === 1) {
            console.log(`location is changed to ${locationRes[0].name}`);
            this.currentAllocationConfiguration.location = locationRes[0];
            this.currentAllocationConfiguration.locationId = locationRes[0].id!;
          }
        }
      }
    )
    
  } 
  locationNameChanged(event: Event) {
    const locationName = (event.target as HTMLInputElement).value.trim();
    if (locationName.length > 0) {

      this.locationService.getLocations(undefined, undefined, locationName).subscribe(
        {
          next: (locationRes) => {
            if (locationRes.length === 1) {
              console.log(`location is changed to ${locationRes[0].name}`);
              this.currentAllocationConfiguration.location = locationRes[0];
              this.currentAllocationConfiguration.locationId = locationRes[0].id;
            }
          }
        }
      )
    }

   
  }  
  
  locationGroupTypeChanged() {
    if (this.currentAllocationConfiguration.locationGroupTypeId) {
      this.validLocationGroupTypes.filter(
        locationGroupType => locationGroupType.id === this.currentAllocationConfiguration.locationGroupTypeId
      ).forEach(
        locationGroupType => this.currentAllocationConfiguration.locationGroupType = locationGroupType
      )
    }
  }
  locationGroupChanged() {
    if (this.currentAllocationConfiguration.locationGroupId) {
      this.validLocationGroups.filter(
        locationGroup => locationGroup.id === this.currentAllocationConfiguration.locationGroupId
      ).forEach(
        locationGroup => this.currentAllocationConfiguration.locationGroup = locationGroup
      )
    }
  }
  
  itemFamilyChanged() {
    if (this.currentAllocationConfiguration.itemFamilyId) {
      this.validItemFamilies.filter(
        itemFamily => itemFamily.id === this.currentAllocationConfiguration.itemFamilyId
      ).forEach(
        itemFamily => this.currentAllocationConfiguration.itemFamily = itemFamily
      )
    }
  } 
}
