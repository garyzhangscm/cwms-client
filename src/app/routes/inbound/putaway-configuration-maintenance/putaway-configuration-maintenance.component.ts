import { Component, Inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { InventoryStatus } from '../../inventory/models/inventory-status';
import { ItemFamily } from '../../inventory/models/item-family';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ItemFamilyService } from '../../inventory/services/item-family.service';
import { ItemService } from '../../inventory/services/item.service';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { LocationGroupType } from '../../warehouse-layout/models/location-group-type';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { LocationGroupTypeService } from '../../warehouse-layout/services/location-group-type.service';
import { LocationGroupService } from '../../warehouse-layout/services/location-group.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { InboundQcConfiguration } from '../models/inbound-qc-configuration';
import { PutawayConfiguration } from '../models/putaway-configuration';
import { PutawayConfigurationStrategy } from '../models/putaway-configuration-strategy';
import { PutawayConfigurationService } from '../services/putaway-configuration.service';

@Component({
    selector: 'app-inbound-putaway-configuration-maintenance',
    templateUrl: './putaway-configuration-maintenance.component.html',
    styleUrls: ['./putaway-configuration-maintenance.component.less'],
    standalone: false
})
export class InboundPutawayConfigurationMaintenanceComponent implements OnInit {
  currentPutawayConfiguration!: PutawayConfiguration;
  stepIndex = 0;
  pageTitle: string = "";
  newPutawayConfiguration = true;
  isSpinning = false; 
  
  validItemFamilies: ItemFamily[] = [];
  validInventoryStatuses: InventoryStatus[] = [];

  
  validLocationGroupTypes: LocationGroupType[] = [];
  validLocationGroups: LocationGroup[] = [];
  selectedStrategies: string[] = []; 
  putawayConfigurationStrategies = PutawayConfigurationStrategy;


  constructor(private http: _HttpClient,
    private companyService: CompanyService,
    private putawayConfigurationService: PutawayConfigurationService,
    private messageService: NzMessageService,
    private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private warehouseService: WarehouseService,
    private itemService: ItemService, 
    private itemFamilyService: ItemFamilyService, 
    private inventoryStatusService: InventoryStatusService,  
    private locationService: LocationService,  
    private locationGroupService: LocationGroupService,  
    private locationGroupTypeService: LocationGroupTypeService,  
    private activatedRoute: ActivatedRoute) {
    this.pageTitle = this.i18n.fanyi('menu.main.inbound.putaway-configuration');

    this.currentPutawayConfiguration = this.createEmptyPutawayConfiguration();
  }

  createEmptyPutawayConfiguration(): PutawayConfiguration {
    return {  
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      strategies: "", 
      putawayConfigurationStrategies: [],
    }
  }


  ngOnInit(): void {


    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        // Get the production line by ID
        this.putawayConfigurationService.getPutawayConfiguration(params.id)
          .subscribe(putawayConfigurationRes => {
            this.currentPutawayConfiguration = putawayConfigurationRes;

            this.newPutawayConfiguration = false;
            
          });
      }
      else {
        // this.currentProductionLine = this.createEmptyProductionLine(); 
        this.newPutawayConfiguration = true;
      }
    });
    
    
    this.loadAvailableInventoryStatus();
    this.loadItemFamlies();
    this.loadLocationGroups();
    this.loadLocationGroupTypes();

  }


  loadLocationGroups() {

    this.locationGroupTypeService.loadLocationGroupTypes().subscribe(
      {
        next:  (locationGroupTypeList: LocationGroupType[]) =>  this.validLocationGroupTypes = locationGroupTypeList
      });
      

  }
  loadLocationGroupTypes() {

    this.locationGroupService.loadLocationGroups().subscribe({
      next: (locationGroupList: LocationGroup[]) => this.validLocationGroups = locationGroupList
    });
    

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
  
  processLocationQueryResult(locationName: any): void { 
  }

  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;

  }

  confirm(): void {
    this.isSpinning = true; 
    if (this.newPutawayConfiguration) {

      this.putawayConfigurationService.addPutawayConfiguration(this.currentPutawayConfiguration)
        .subscribe({
          next: () => {
            this.messageService.success(this.i18n.fanyi('message.save.complete'));
            setTimeout(() => {
              this.isSpinning = false;
              this.router.navigateByUrl(`/inbound/putaway-configuration`);
            }, 500);
          },
          error: () => this.isSpinning = false


        }); 
    }
    else {
      

      this.putawayConfigurationService.changePutawayConfiguration(this.currentPutawayConfiguration)
        .subscribe({
          next: () => {
            this.messageService.success(this.i18n.fanyi('message.save.complete'));
            setTimeout(() => {
              this.isSpinning = false;
              this.router.navigateByUrl(`/inbound/putaway-configuration`);
            }, 500);
          },
          error: () => this.isSpinning = false


        }); 
        
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
              this.currentPutawayConfiguration.item = itemsRes[0];
              this.currentPutawayConfiguration.itemId = itemsRes[0].id!;
            }
          }
        }
      )
    }
  }
  
  locationNameChanged(event: Event) {
    const locationName = (event.target as HTMLInputElement).value.trim();
    if (locationName.length > 0) {

      this.locationService.getLocations(undefined, undefined, locationName).subscribe(
        {
          next: (locationRes) => {
            if (locationRes.length === 1) {
              console.log(`location is changed to ${locationRes[0].name}`);
              this.currentPutawayConfiguration.location = locationRes[0];
              this.currentPutawayConfiguration.locationId = locationRes[0].id!;
            }
          }
        }
      )
    }
  }
  

  processItemQueryResult(selectedItemName: any): void {
    console.log(`start to query with location name ${selectedItemName}`);
    this.itemService.getItems(selectedItemName).subscribe(
      {
        next: (itemsRes) => {
          if (itemsRes.length === 1) {
            this.currentPutawayConfiguration.item = itemsRes[0];
            this.currentPutawayConfiguration.itemId = itemsRes[0].id!;
          }
        }
      }
    )
    
  } 
  procesLocationQueryResult(selectedLocationName: any): void {
    console.log(`start to query with location name ${selectedLocationName}`);
    this.locationService.getLocations(undefined, undefined, selectedLocationName).subscribe(
      {
        next: (locationRes) => {
          if (locationRes.length === 1) {
            console.log(`location is changed to ${locationRes[0].name}`);
            this.currentPutawayConfiguration.location = locationRes[0];
            this.currentPutawayConfiguration.locationId = locationRes[0].id!;
          }
        }
      }
    )
    
  } 
  
  itemFamilyChanged(id: number) {
    
    this.currentPutawayConfiguration.itemFamilyId = id;
    
    this.currentPutawayConfiguration.itemFamily = 
      this.validItemFamilies.find(
        itemFamily => itemFamily.id === id
      );

      
  }
  inventoryStatusChanged(id: number) {
    
    this.currentPutawayConfiguration.inventoryStatusId = id;
    
    this.currentPutawayConfiguration.inventoryStatus = 
      this.validInventoryStatuses.find(
        inventoryStatus => inventoryStatus.id === id
      );

      
  }
  locationGroupChanged() {

    this.currentPutawayConfiguration.locationGroup =
        this.validLocationGroups.find(
          locationGroup => locationGroup.id === this.currentPutawayConfiguration.locationGroupId
        )

  }
  locationGroupTypeChanged() {

    this.currentPutawayConfiguration.locationGroupType =
        this.validLocationGroupTypes.find(
          locationGroupType => locationGroupType.id === this.currentPutawayConfiguration.locationGroupTypeId
        )

  }
  selectedStrategiesChanged() {
    console.log(`1. strategies is changed to ${JSON.stringify(this.selectedStrategies)}`);
    this.currentPutawayConfiguration.strategies = this.selectedStrategies.join(",")
    console.log(`2. strategies is changed to ${this.currentPutawayConfiguration.strategies}`);
  }
  readyForConfirm() {
    
    // we have to have at lease
    // 1. sequence number
    // 2. one putaway strategy
    // 3. one of location / location group / location group type
    return this.currentPutawayConfiguration.strategies !== undefined &&
             this.currentPutawayConfiguration.strategies.length > 0 &&
             this.currentPutawayConfiguration.sequence !== undefined && 
             (
              this.currentPutawayConfiguration.locationId !== undefined ||
              this.currentPutawayConfiguration.locationGroupId !== undefined ||
              this.currentPutawayConfiguration.locationGroupTypeId !== undefined);
  }

}
