import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 
import { UserService } from '../../auth/services/user.service'; 
import { PickZone } from '../models/pick-zone';
import { PickZoneService } from '../services/pick-zone.service';

@Component({
    selector: 'app-warehouse-layout-pick-zone',
    templateUrl: './pick-zone.component.html',
    styleUrls: ['./pick-zone.component.less'],
    standalone: false
})
export class WarehouseLayoutPickZoneComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  isSpinning = false; 
  
  pickZones: PickZone[] = []; 
  searchForm!: UntypedFormGroup;
   
  searchResult = ''; 

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [ 
    
    { title: this.i18n.fanyi("name"),  index: 'name'   }, 
    { title: this.i18n.fanyi("description"),  index: 'description'  }, 
    { title: this.i18n.fanyi("pickable"),  index: 'pickable' , type:"yn"  }, 
    { title: this.i18n.fanyi("allowCartonization"),  index: 'allowCartonization' ,   type:"yn"   },  
    {
      title: this.i18n.fanyi("action"),  
      render: 'actionColumn', 
      iif: () => !this.displayOnly
    }
  ];   

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private titleService: TitleService,
    private pickZoneService: PickZoneService,  
    private userService: UserService,
    private activatedRoute: ActivatedRoute
  ) { 
    userService.isCurrentPageDisplayOnly("/warehouse-layout/pick-zone").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                             
  }

  ngOnInit(): void {  
    this.titleService.setTitle(this.i18n.fanyi('menu.main.alert.alert'));
    // initiate the search form
    this.searchForm = this.fb.group({
      name: [null], 

    });

    
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['name']) {  
        this.searchForm!.value.name.setValue(params['name']);
        this.search();
      } 
    }); 
  }

  resetForm(): void {
    this.pickZones = []; 

    this.searchResult = '';
  }
  search(): void {
    this.searchResult = '';
    this.isSpinning = true;
    
    this.pickZoneService.getPickZones(this.searchForm!.value.name.value).subscribe({
      next: (pickZoneRes) => {
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: pickZoneRes.length,
        });
        this.pickZones = pickZoneRes;
      },
      error: () => this.isSpinning = false
    });
  }  

  removePickZone(id: number): void {
    // make sure we have at least one checkbox checked
    this.isSpinning = true;
    this.pickZoneService.removePickZoneById(id).subscribe({
      next: () => {
        this.isSpinning = false;
        this.search();
      },
      error: () => this.isSpinning = false

    })
  } 
}
