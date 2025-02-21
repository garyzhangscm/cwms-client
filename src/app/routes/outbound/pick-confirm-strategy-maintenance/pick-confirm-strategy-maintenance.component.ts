import { Component, Inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UnitOfMeasure } from '../../common/models/unit-of-measure';
import { UnitOfMeasureService } from '../../common/services/unit-of-measure.service';
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
import { PickConfirmStrategy } from '../models/pick-confirm-strategy';
import { AllocationConfigurationService } from '../services/allocation-configuration.service';
import { PickConfirmStrategyService } from '../services/pick-confirm-strategy.service';

@Component({
    selector: 'app-outbound-pick-confirm-strategy-maintenance',
    templateUrl: './pick-confirm-strategy-maintenance.component.html',
    standalone: false
})
export class OutboundPickConfirmStrategyMaintenanceComponent implements OnInit {
  currentPickConfirmStrategy!: PickConfirmStrategy; 
  validItemFamilies: ItemFamily[] = []; 
  validLocationGroupTypes: LocationGroupType[] = [];
  validLocationGroups: LocationGroup[] = [];
  validUnitOfMeasures: UnitOfMeasure[] = [];  

   
  stepIndex = 0;
  pageTitle: string = "";
  newPickConfirmStrategy = true;
  isSpinning = false; 


  constructor(private http: _HttpClient, 
    private pickConfirmStrategyService: PickConfirmStrategyService,
    private messageService: NzMessageService,
    private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private warehouseService: WarehouseService,
    private itemService: ItemService, 
    private itemFamilyService: ItemFamilyService,  
    private locationGroupTypeService: LocationGroupTypeService,  
    private locationGroupService: LocationGroupService,  
    private locationService: LocationService,
    private unitOfMeasureService: UnitOfMeasureService,
    private activatedRoute: ActivatedRoute) {
    this.pageTitle = this.i18n.fanyi('pick-confirm-strategy');

    this.currentPickConfirmStrategy = this.createEmptyPickConfirmStrategy();
  }

  createEmptyPickConfirmStrategy(): PickConfirmStrategy {
    return {  
      warehouseId: this.warehouseService.getCurrentWarehouse().id, 
      confirmItemFlag: false,
      confirmLocationFlag: false,
      confirmLocationCodeFlag: false,
      confirmLpnFlag: false,
    }
  }


  ngOnInit(): void {


    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) { 
        this.isSpinning = true;
        this.pickConfirmStrategyService.getPickConfirmStrategy(params.id)
          .subscribe(
          {

            next: (pickConfirmStrategy) => {
              this.currentPickConfirmStrategy = pickConfirmStrategy;

              this.newPickConfirmStrategy = false; 
              
              this.isSpinning = false;
            }, 
            error: () => {
              this.isSpinning = false;
            }

          })
          
      }
      else {
         
        this.newPickConfirmStrategy = true;
      }
    }); 
    this.loadItemFamlies();
     

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

  }
 
  confirm(): void {
    this.isSpinning = true;
    
    if (this.newPickConfirmStrategy) {

      this.pickConfirmStrategyService.addPickConfirmStrategy(this.currentPickConfirmStrategy)
        .subscribe({
          next: (pickConfirmStrategyRes) => {
            this.messageService.success(this.i18n.fanyi('message.save.complete'));
            setTimeout(() => {
              this.isSpinning = false;
              this.router.navigateByUrl(`/outbound/pick-confirm-strategy?sequence=${pickConfirmStrategyRes.sequence}`);
            }, 500);
          },
          error: () => this.isSpinning = false


        }); 
    }
    else {
      

      this.pickConfirmStrategyService.changePickConfirmStrategy(this.currentPickConfirmStrategy)
        .subscribe({
          next: (pickConfirmStrategyRes) => { 
            this.messageService.success(this.i18n.fanyi('message.save.complete'));
            setTimeout(() => {
              this.isSpinning = false;
              this.router.navigateByUrl(`/outbound/pick-confirm-strategy?sequence=${pickConfirmStrategyRes.sequence}`);
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
            this.currentPickConfirmStrategy.item = itemsRes[0];
            this.currentPickConfirmStrategy.itemId = itemsRes[0].id;
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
              this.currentPickConfirmStrategy.item = itemsRes[0];
              this.currentPickConfirmStrategy.itemId = itemsRes[0].id;
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
            this.currentPickConfirmStrategy.location = locationRes[0];
            this.currentPickConfirmStrategy.locationId = locationRes[0].id!;
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
              this.currentPickConfirmStrategy.location = locationRes[0];
              this.currentPickConfirmStrategy.locationId = locationRes[0].id;
            }
          }
        }
      )
    }

   
  }  
  
  locationGroupTypeChanged() {
    if (this.currentPickConfirmStrategy.locationGroupTypeId) {
      this.validLocationGroupTypes.filter(
        locationGroupType => locationGroupType.id === this.currentPickConfirmStrategy.locationGroupTypeId
      ).forEach(
        locationGroupType => this.currentPickConfirmStrategy.locationGroupType = locationGroupType
      )
    }
  }
  locationGroupChanged() {
    if (this.currentPickConfirmStrategy.locationGroupId) {
      this.validLocationGroups.filter(
        locationGroup => locationGroup.id === this.currentPickConfirmStrategy.locationGroupId
      ).forEach(
        locationGroup => this.currentPickConfirmStrategy.locationGroup = locationGroup
      )
    }
  }
  
  itemFamilyChanged() {
    if (this.currentPickConfirmStrategy.itemFamilyId) {
      this.validItemFamilies.filter(
        itemFamily => itemFamily.id === this.currentPickConfirmStrategy.itemFamilyId
      ).forEach(
        itemFamily => this.currentPickConfirmStrategy.itemFamily = itemFamily
      )
    }
  } 

}
