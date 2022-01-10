import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

import { ItemService } from '../../inventory/services/item.service';
import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { MasterProductionSchedule } from '../models/master-production-schedule';
import { MasterProductionScheduleService } from '../services/master-production-schedule.service';

@Component({
  selector: 'app-work-order-mps-maintenance',
  templateUrl: './mps-maintenance.component.html',
})
export class WorkOrderMpsMaintenanceComponent implements OnInit {

  currentMPS!: MasterProductionSchedule;
  pageTitle = "";
  isSpinning = false;
  stepIndex = 0;
  newMPS = true;

  constructor(private http: _HttpClient, 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private masterProductionScheduleService: MasterProductionScheduleService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private warehouseService: WarehouseService,
    private itemService: ItemService,
    ) { 
    this.currentMPS = {
        
      warehouseId: this.warehouseService.getCurrentWarehouse().id,

      number: "",
      description: "",
      
      cutoffDate: [],
 
      item: {
         
        name: "",
        description: "",
        
        itemPackageTypes: []
         
      },
      
      totalQuantity: 0,
      masterProductionScheduleLines: []
    }
  }

  ngOnInit(): void {

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        // Get the production line by ID
        this.masterProductionScheduleService.getMasterProductionSchedule(params.id)
          .subscribe(mpsRes => {
            this.currentMPS = mpsRes;

            this.newMPS = false;
            
          });
      }
      else {
        // this.currentProductionLine = this.createEmptyProductionLine(); 
        this.newMPS = true;
      }
    });
   }

   
  itemNameChanged(event: Event) {
    const itemName = (event.target as HTMLInputElement).value.trim();
    if (itemName.length > 0) {

      this.itemService.getItems(itemName).subscribe(
        {
          next: (itemsRes) => {
            if (itemsRes.length === 1) { 
              this.currentMPS.item = itemsRes[0];
              this.currentMPS.itemId = itemsRes[0].id!;
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
            this.currentMPS.item = itemsRes[0];
            this.currentMPS.itemId = itemsRes[0].id!;
          }
        }
      }
    )
    
  }

}
