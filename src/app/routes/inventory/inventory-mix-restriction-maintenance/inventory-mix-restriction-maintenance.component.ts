import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TransferItem } from 'ng-zorro-antd/transfer';

import { Client } from '../../common/models/client'; 
import { ClientService } from '../../common/services/client.service'; 
import { LocalCacheService } from '../../util/services/local-cache.service'; 
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { LocationGroupType } from '../../warehouse-layout/models/location-group-type'; 
import { LocationGroupTypeService } from '../../warehouse-layout/services/location-group-type.service';
import { LocationGroupService } from '../../warehouse-layout/services/location-group.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service'; 
import { InventoryMixRestriction } from '../models/inventory-mix-restriction';
import { InventoryMixRestrictionAttribute } from '../models/inventory-mix-restriction-attribute';
import { InventoryMixRestrictionLine } from '../models/inventory-mix-restriction-line';
import { InventoryMixRestrictionLineType } from '../models/inventory-mix-restriction-line-type'; 
import { InventoryMixRestrictionService } from '../services/inventory-mix-restriction.service';

@Component({
    selector: 'app-inventory-inventory-mix-restriction-maintenance',
    templateUrl: './inventory-mix-restriction-maintenance.component.html',
    standalone: false
})
export class InventoryInventoryMixRestrictionMaintenanceComponent implements OnInit {
  pageTitle = '';
  stepIndex = 0;
  currentInventoryMixRestriction!: InventoryMixRestriction;
  newInventoryMixRestriction= true;
  availableClients: Client[] = [];
  
  locationGroupTypes: LocationGroupType[] = [];
  locationGroups: LocationGroup[] = [];

  isSpinning = false;
  threePartyLogisticsFlag = false;
  
  inventoryAttributes = InventoryMixRestrictionAttribute;

  
  attributeByLPNList: TransferItem[] = []; 
  attributeByLocationList: TransferItem[] = []; 

  unassignedText: string = "";
  assignedText: string = "";


  constructor( 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private messageService: NzMessageService,
    private router: Router, 
    private activatedRoute: ActivatedRoute,
    private warehouseService: WarehouseService, 
    private clientService: ClientService, 
    private locationService: LocationService,
    private locationGroupService: LocationGroupService,
    private locationGroupTypeService: LocationGroupTypeService,
    private inventoryMixRestrictionService: InventoryMixRestrictionService, 
    private localCacheService: LocalCacheService
  ) { 

    this.currentInventoryMixRestriction = this.getEmptyInventoryMixRestriction();
  }
  getEmptyInventoryMixRestriction(): InventoryMixRestriction {
    return {
       
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      lines: [],
      byLPNLines: [],
      byLocationLines: [],
    }
  }
 
  ngOnInit(): void {

    
    this.unassignedText = this.i18n.fanyi('unassigned');
    this.assignedText = this.i18n.fanyi('assigned');
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        this.titleService.setTitle(this.i18n.fanyi('modify'));
        this.pageTitle = this.i18n.fanyi('modify');
        this.inventoryMixRestrictionService.getInventoryMixRestriction(params.id).subscribe(
        {
          next: (inventoryMixRestrictionRes) => {
              this.currentInventoryMixRestriction = inventoryMixRestrictionRes;
              this.setupLines(this.currentInventoryMixRestriction);
              this.newInventoryMixRestriction = false;
              // setup the transfer control to display the lines
              this.initAttributeByLPNList();
              this.initAttributeBLocationList();
          }

        })
      } 
      else {
        
        this.titleService.setTitle(this.i18n.fanyi('new'));
        this.pageTitle = this.i18n.fanyi('new');
        this.currentInventoryMixRestriction = this.getEmptyInventoryMixRestriction();
        this.newInventoryMixRestriction = true; 
        // setup the transfer control to display the lines
        this.initAttributeByLPNList();
        this.initAttributeBLocationList();
      }
    });

    this.stepIndex = 0;
      
    this.locationGroupTypeService.loadLocationGroupTypes().subscribe((locationGroupTypeList: LocationGroupType[]) => {
      this.locationGroupTypes = locationGroupTypeList;
    });
    this.locationGroupService.loadLocationGroups().subscribe((locationGroupList: LocationGroup[]) => {
      this.locationGroups = locationGroupList;
    });
    this.initClientAssignment();
  } 
  
  setupLines(inventoryMixRestriction: InventoryMixRestriction) {
    inventoryMixRestriction.byLocationLines = [];
    inventoryMixRestriction.byLPNLines = [];

    inventoryMixRestriction.lines.forEach(
      line => {
        if (line.type === InventoryMixRestrictionLineType.BY_LOCATION) {
          inventoryMixRestriction.byLocationLines = [...inventoryMixRestriction.byLocationLines, 
            line
          ];
          // inventoryMixRestriction.byLocationLines.push(line);
        }
        else if (line.type === InventoryMixRestrictionLineType.BY_LPN) {
          inventoryMixRestriction.byLPNLines = [...inventoryMixRestriction.byLPNLines, 
            line
          ];
          //inventoryMixRestriction.byLPNLines.push(line);
        }
      }
    );

    console.log(`inventoryMixRestriction.lines: ${inventoryMixRestriction.lines.length}`)
    console.log(`inventoryMixRestriction.byLocationLines: ${inventoryMixRestriction.byLocationLines.length}`)
    console.log(`inventoryMixRestriction.byLPNLines: ${inventoryMixRestriction.byLPNLines.length}`)
 
  }
  
  initClientAssignment(): void {
     
    this.clientService.getClients().subscribe({
      next: (clientRes) => this.availableClients = clientRes
       
    });
    this.localCacheService.getWarehouseConfiguration().subscribe({
      next: (warehouseConfigRes) => {

        if (warehouseConfigRes && warehouseConfigRes.threePartyLogisticsFlag) {
          this.threePartyLogisticsFlag = true;
        }
        else {
          this.threePartyLogisticsFlag = false;
        } 
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
    });
    
  }


  locationNameChanged(event: Event) {
    const locationName = (event.target as HTMLInputElement).value.trim();
    this.setupLocationName(locationName);
  }
  
  processLocationQueryResult(locationName: any): void {
    this.setupLocationName(locationName);
  }

  setupLocationName(locationName: string) : void {
    if (locationName && locationName.length > 0) { 
      this.locationService.getLocations(undefined, undefined, locationName).subscribe({
        next: (locationsRes) => {
          if (locationsRes && locationsRes.length == 1) {
            this.currentInventoryMixRestriction.location = locationsRes[0];
            this.currentInventoryMixRestriction.locationId = locationsRes[0].id;
          }
        },  
  
      })
    }
  }

  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
    if (this.stepIndex == 1) {
      this.setupCriteriaForConfirm();
      this.setupLinesForConfirm();
    }
  }

  setupCriteriaForConfirm() {
    if (this.currentInventoryMixRestriction.clientId != null &&
          this.currentInventoryMixRestriction.client == null) {

        this.currentInventoryMixRestriction.client = this.availableClients.find(
          client => client.id === this.currentInventoryMixRestriction.clientId
        );
    }
    
    if (this.currentInventoryMixRestriction.locationGroupTypeId != null &&
      this.currentInventoryMixRestriction.locationGroupType == null) {
        
        this.currentInventoryMixRestriction.locationGroupType = this.locationGroupTypes.find(
          locationGroupType => locationGroupType.id === this.currentInventoryMixRestriction.locationGroupTypeId
        ); 
    }
    
    if (this.currentInventoryMixRestriction.locationGroupId != null &&
      this.currentInventoryMixRestriction.locationGroup == null) {
        
        this.currentInventoryMixRestriction.locationGroup = this.locationGroups.find(
          locationGroup => locationGroup.id === this.currentInventoryMixRestriction.locationGroupId
        ); 
    }

  }
  // we allow the user to setup the lines based on the type
  // now we will need to combine them into one list and pass the
  // list back to server
  setupLinesForConfirm() {
    
    // setup the assigned attribute
      const currentAssignedAttributeByLPNList = [
        ...this.attributeByLPNList.filter(item => item.direction === 'right').map(item => item.key)]; 
      const currentAssignedAttributeByLocationList = [
        ...this.attributeByLocationList.filter(item => item.direction === 'right').map(item => item.key)]; 

      this.currentInventoryMixRestriction.byLPNLines =  currentAssignedAttributeByLPNList.map(
        inventoryAttribute => {    
          return {
            type:  InventoryMixRestrictionLineType.BY_LPN,
            attribute: inventoryAttribute
          }
        }
      );
      this.currentInventoryMixRestriction.byLocationLines =  currentAssignedAttributeByLocationList.map(
        inventoryAttribute => {    
          return {
            type:  InventoryMixRestrictionLineType.BY_LOCATION,
            attribute: inventoryAttribute
          }
        }
      );
    this.currentInventoryMixRestriction.lines = [
      ...this.currentInventoryMixRestriction.byLPNLines,
      ...this.currentInventoryMixRestriction.byLocationLines
    ]
 
  }
  confirm(): void {

    if (this.newInventoryMixRestriction) {
      this.isSpinning = true;
      this.inventoryMixRestrictionService.addInventoryMixRestriction(this.currentInventoryMixRestriction).subscribe({
        next: (inventoryMixRestrictionRes) => {
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            
            this.router.navigateByUrl(this.getReturnUrl(inventoryMixRestrictionRes));
          }, 500);
        }, 
        error: () => this.isSpinning = false
      }); 
      
    } else {
      
      this.isSpinning = true;
      this.inventoryMixRestrictionService.changeInventoryMixRestriction(this.currentInventoryMixRestriction).subscribe({
        next: (inventoryMixRestrictionRes) => {
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            
            this.router.navigateByUrl(this.getReturnUrl(inventoryMixRestrictionRes));
          }, 500);
        }, 
        error: () => this.isSpinning = false
      }); 
    }
  }
 
  getReturnUrl(inventoryMixRestriction: InventoryMixRestriction) : string {
    let url = `/inventory/mix-restriction?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (inventoryMixRestriction.clientId) {
      url = `${url}&clientId=${inventoryMixRestriction.clientId}`;
    }
    if (inventoryMixRestriction.location) {
      url = `${url}&locationName=${inventoryMixRestriction.location.name}`;
    }

    if (inventoryMixRestriction.locationGroupId) {
      url = `${url}&locationGroupId=${inventoryMixRestriction.locationGroupId}`;
    }

    if (inventoryMixRestriction.locationGroupTypeId) {
      url = `${url}&locationGroupTypeId=${inventoryMixRestriction.locationGroupTypeId}`;
    }


    return url;
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

  transferListChange(ret: {}): void {
    console.log('nzChange', ret);
  }

  
  initAttributeByLPNList(): void { 
    Object.keys(InventoryMixRestrictionAttribute).forEach(
      inventoryAttribute => {
        console.log(`start to add inventoryAttribute to by LPN list: ${inventoryAttribute}`);
        this.attributeByLPNList = [...this.attributeByLPNList, 
        {
          
          key: inventoryAttribute,
          title: this.i18n.fanyi(`INVENTORY_ATTRIBUTE-${inventoryAttribute}`),
          direction: 
              this.currentInventoryMixRestriction.byLPNLines.some(line => line.attribute == inventoryAttribute) ?
              'right' : 'left'
        }]
      }
    )
  } 

  initAttributeBLocationList(): void { 
    Object.keys(InventoryMixRestrictionAttribute).forEach(
      inventoryAttribute => {
        console.log(`start to add inventoryAttribute to by Location list: ${inventoryAttribute}`);
        this.attributeByLocationList = [...this.attributeByLocationList, 
        {          
          key: inventoryAttribute,
          title: this.i18n.fanyi(`INVENTORY_ATTRIBUTE-${inventoryAttribute}`),
          direction: 
              this.currentInventoryMixRestriction.byLocationLines.some(line => line.attribute == inventoryAttribute) ?
              'right' : 'left'
        }]
      }
    )
  } 
 
}
