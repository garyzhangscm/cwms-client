import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder , UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { LocationGroupType } from '../../warehouse-layout/models/location-group-type';
import { LocationGroupTypeService } from '../../warehouse-layout/services/location-group-type.service';
import { LocationGroupService } from '../../warehouse-layout/services/location-group.service'; 
import { InventoryMixRestriction } from '../models/inventory-mix-restriction';
import { InventoryMixRestrictionService } from '../services/inventory-mix-restriction.service';

@Component({
    selector: 'app-inventory-inventory-mix-restriction',
    templateUrl: './inventory-mix-restriction.component.html',
    styleUrls: ['./inventory-mix-restriction.component.less'],
    standalone: false
})
export class InventoryInventoryMixRestrictionComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  availableClients: Client[] = [];
  searchForm!: UntypedFormGroup; 
  inventoryMixRestrictionList: InventoryMixRestriction[] = [];
  
  locationGroupTypes: LocationGroupType[] = [];
  locationGroups: LocationGroup[] = [];

  searching = false;
  searchResult = '';
  isSpinning = false;
  threePartyLogisticsFlag = false;

  
  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    
    { title: this.i18n.fanyi("client"),  index: 'client.name' ,  }, 
    { title: this.i18n.fanyi("location-group-type"),  index: 'locationGroupType.name' ,  }, 
    { title: this.i18n.fanyi("location-group"),  index: 'locationGroup.name' ,  }, 
    { title: this.i18n.fanyi("location"),  index: 'location.name' ,  }, 
    {
      title: this.i18n.fanyi("action"),  
      render: 'actionColumn', width: 200, 
      iif: () => !this.displayOnly 
    }
  ]; 
  
  displayOnly = false;
  constructor(
    private clientService: ClientService,
    private fb: UntypedFormBuilder, 
    private messageService: NzMessageService,    
    private localCacheService: LocalCacheService, 
    private activatedRoute: ActivatedRoute,
    private locationGroupService: LocationGroupService,
    private locationGroupTypeService: LocationGroupTypeService,
    private userService: UserService,
    private inventoryMixRestrictionService: InventoryMixRestrictionService,
  ) { 
    userService.isCurrentPageDisplayOnly("/inventory/mix-restriction").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                              
  }
  

  ngOnInit(): void { 
    this.initClientAssignment();

    
    this.searchForm = this.fb.group({
      client: [null],
      locationGroupType: [null],
      locationGroup: [null],
      location: [null],
    });

    this.activatedRoute.queryParams.subscribe(params => {
      let autoSearch = false;

      if (params['clientId']) {         
        this.searchForm.value.client.setValue(params['clientId']);
        autoSearch = true;
      }  
      if (params['locationGroupTypeId']) {         
        this.searchForm.value.locationGroupType.setValue(params['locationGroupTypeId']);
        autoSearch = true;
      }  
      if (params['locationGroupId']) {         
        this.searchForm.value.locationGroup.setValue(params['locationGroupId']);
        autoSearch = true;
      }
      if (params['locationName']) {         
        this.searchForm.value.location.setValue(params['locationName']);
        autoSearch = true;
      }
      if (autoSearch) {
        this.search();
      }
    });
    
    // initiate the select control
    this.locationGroupTypeService.loadLocationGroupTypes().subscribe((locationGroupTypeList: LocationGroupType[]) => {
      this.locationGroupTypes = locationGroupTypeList;
    });
    this.locationGroupService.loadLocationGroups().subscribe((locationGroupList: LocationGroup[]) => {
      this.locationGroups = locationGroupList;
    });

  }

  processLocationQueryResult(selectedLocationName: any): void {
    console.log(`start to query with location name ${selectedLocationName}`);
    this.searchForm.value.location.setValue(selectedLocationName);
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

  
  resetForm(): void {
    this.searchForm.reset();
    this.inventoryMixRestrictionList = []; 


  }
  search(): void {
      this.isSpinning = true;
      this.searchResult = '';     
      
      this.inventoryMixRestrictionService
        .getInventoryMixRestrictions(
          this.searchForm.value.client,
          undefined,
          this.searchForm.value.locationGroup,
          this.searchForm.value.locationGroupType,
          this.searchForm.value.location,
        )
        .subscribe({
            next: (inventoryMixRestrictionRes) => {
              this.isSpinning = false;
              this.searchResult = this.i18n.fanyi('search_result_analysis', {
                currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
                rowCount: inventoryMixRestrictionRes.length,
              });
              this.inventoryMixRestrictionList = inventoryMixRestrictionRes;
            }, 
            error: () => {
              this.isSpinning = false;
              this.searchResult = '';
            },
        
        });
  }
   
  removeInventoryMixRestriction(inventoryMixRestrictionId: number)  {
    this.isSpinning = true
    this.inventoryMixRestrictionService.removeInventoryMixRestriction(inventoryMixRestrictionId)
    .subscribe({
      next: () => {
        
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        
        setTimeout(() => {
          this.search();
        }, 500);
      }, 
      error: () =>  this.isSpinning = false
    })
  }
}
