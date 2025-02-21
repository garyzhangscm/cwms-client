import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { MaterialRequirementsPlanning } from '../models/material-requirements-planning';
import { MaterialRequirementsPlanningService } from '../services/material-requirements-planning.service';

@Component({
    selector: 'app-work-order-mrp',
    templateUrl: './mrp.component.html',
    styleUrls: ['./mrp.component.less'],
    standalone: false
})
export class WorkOrderMrpComponent implements OnInit {
  searchForm!: UntypedFormGroup;
  
  listOfAllMRPs: MaterialRequirementsPlanning[] = [];
  isSpinning = false;
  searchResult= "";
  loadingMRPDetailsRequest = 0;
  
  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private materialRequirementsPlanningService: MaterialRequirementsPlanningService,
    private activatedRoute: ActivatedRoute,   
    private localCacheService: LocalCacheService,
    private userService: UserService,
  ) { 
    userService.isCurrentPageDisplayOnly("/work-order/mrp").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                                      
 
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('MRP'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      description: [null],
      mpsNumber: [null],
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['number']) {
        this.searchForm.value.number.setValue(params['number']);
        this.search();
      }
    });

  }
  
  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllMRPs = []; 

  }
  
  search(): void {
    this.isSpinning = true; 
     

    this.materialRequirementsPlanningService.getMRPs(
      this.searchForm.value.number.value,  
      this.searchForm.value.description.value,  
      this.searchForm.value.mpsNumber.value).subscribe(
        mrpRes => {
  

          // this.collapseAllRecord(expandedOrderId);

          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: mrpRes.length,
          });
          this.listOfAllMRPs =mrpRes; 
          this.refreshDetailInformations(this.listOfAllMRPs);
         
        },
        () => {
          this.isSpinning = false;
          this.searchResult = '';
        },
    );
  }

  
  // we will load the client / supplier / item information 
  // asyncronized
  async refreshDetailInformations(mrps: MaterialRequirementsPlanning[]) {  
    // const currentPageOrders = this.getCurrentPageOrders(); 
    let index = 0;
    this.loadingMRPDetailsRequest = 0;
    while (index < mrps.length) {

      // we will need to make sure we are at max loading detail information
      // for 10 orders at a time(each order may have 5 different request). 
      // we will get error if we flush requests for
      // too many orders into the server at a time
      // console.log(`1. this.loadingOrderDetailsRequest: ${this.loadingOrderDetailsRequest}`);
      
      
      while(this.loadingMRPDetailsRequest > 50) {
        // sleep 50ms        
        await this.delay(50);
      } 
      
      this.refreshDetailInformation(mrps[index]);
      index++;
    } 
    while(this.loadingMRPDetailsRequest > 0) {
      // sleep 50ms        
      await this.delay(100);
    }  
    // refresh the table while everything is loaded
    console.log(`mnaually refresh the table`);   
    this.st.reload();  
  }
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
  
 
  refreshDetailInformation(mrp: MaterialRequirementsPlanning) {
    this.loadItem(mrp);
  }
  loadItem(mrp: MaterialRequirementsPlanning) {
     
    if (mrp.itemId && mrp.item == null) {
      this.loadingMRPDetailsRequest++;
      this.localCacheService.getItem(mrp.itemId).subscribe(
        {
          next: (res) => {
            mrp.item = res;
            this.loadingMRPDetailsRequest--;
          }
        }
      );      
    } 
  }

  
  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    
    { title: this.i18n.fanyi("number"), index: 'number', iif: () => this.isChoose('number'), width: 100},
    { title: this.i18n.fanyi("description"), index: 'description', iif: () => this.isChoose('description'), width: 150}, 
    {
      title: this.i18n.fanyi("item"),
      // renderTitle: 'customTitle',
      render: 'itemNameColumn',
      iif: () => this.isChoose('itemName'), width: 100
    }, 
    {
      title: this.i18n.fanyi("item.description"),
      // renderTitle: 'customTitle',
      render: 'itemDescriptionColumn',
      iif: () => this.isChoose('itemDescription'), width: 100
    },
    { title: this.i18n.fanyi("mps"), index: 'masterProductionSchedule.number', iif: () => this.isChoose('mps'), width: 100 }, 
    {
      title: this.i18n.fanyi("cutoffDate"),
      // renderTitle: 'customTitle',
      render: 'cutoffDateColumn',
      iif: () => this.isChoose('cutoffDate'), width: 100
    },
    /**
     * 
    {
      title: 'action',
      fixed: 'right',width: 100, 
      render: 'actionColumn',
    }, 
     */
   
  ];
  customColumns = [
 
    { label: this.i18n.fanyi("number"), value: 'number', checked: true }, 
    { label: this.i18n.fanyi("description"), value: 'description', checked: true }, 
    { label: this.i18n.fanyi("item"), value: 'itemName', checked: true }, 
    { label: this.i18n.fanyi("item.description"), value: 'itemDescription', checked: true }, 
    { label: this.i18n.fanyi("mps"), value: 'mps', checked: true }, 
    { label: this.i18n.fanyi("cutoffDate"), value: 'cutoffDate', checked: true },  
  ];

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.st !== undefined && this.st.columns !== undefined) {
      this.st!.resetColumns({ emitReload: true });

    }
  }
  
  mpsTableChanged(event: STChange) : void { 
    console.log(`mpsTableChanged: ${event.type}`)
    if (event.type === 'expand' && event.expand.expand === true) {
      
      this.showMRPDetails(event.expand);
    } 

  }
  
  showMRPDetails(materialRequirementsPlanning: MaterialRequirementsPlanning) { 
    materialRequirementsPlanning.materialRequirementsPlanningLines.forEach(
      mrpLine => {
        if (mrpLine.itemId && mrpLine.item == null) {

           this.localCacheService.getItem(mrpLine.itemId).subscribe(
             {
               next: (itemRes) => {
                mrpLine.item = itemRes; 
               }
             });
        }
      }
    )
  }

}
