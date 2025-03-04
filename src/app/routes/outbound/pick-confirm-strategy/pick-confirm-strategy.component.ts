import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message'; 
import { UserService } from '../../auth/services/user.service';
import { ItemFamily } from '../../inventory/models/item-family';
import { ItemFamilyService } from '../../inventory/services/item-family.service'; 
import { PickConfirmStrategy } from '../models/pick-confirm-strategy'; 
import { PickConfirmStrategyService } from '../services/pick-confirm-strategy.service';

@Component({
    selector: 'app-outbound-pick-confirm-strategy',
    templateUrl: './pick-confirm-strategy.component.html',
    styleUrls: ['./pick-confirm-strategy.component.less'],
    standalone: false
})
export class OutboundPickConfirmStrategyComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  // Select control for clients and item families

  itemFamilies: ItemFamily[] = [];

  // Form related data and functions
  searchForm!: UntypedFormGroup;

  searching = false;
  isSpinning = false;
  searchResult = '';
  // Table data for display
  pickConfirmStrategies: PickConfirmStrategy[] = []; 


  isCollapse = false;

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  
  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    
    {
      title: this.i18n.fanyi("sequence"), 
      index: 'sequence' , width: 200, 
    },    
    {
      title: this.i18n.fanyi("item"), 
      index: 'item.name' , width: 200, 
    },    
    {
      title: this.i18n.fanyi("itemFamily"), 
      index: 'itemFamily.name' , width: 200, 
    },    
    {
      title: this.i18n.fanyi("location"), 
      index: 'location.name' , width: 200, 
    },    

    {
      title: this.i18n.fanyi("locationGroup"), 
      index: 'locationGroup.name' , width: 200, 
    },    

    {
      title: this.i18n.fanyi("locationGroupType"), 
      index: 'locationGroupType.name' , width: 200, 
    },    
    {
      title: this.i18n.fanyi("unitOfMeasure"), 
      index: 'unitOfMeasure.name' , width: 200, 
    },    
    {
      title: this.i18n.fanyi("confirmItemFlag"), 
      index: 'confirmItemFlag' , width: 200, type: 'yn' 
    },    
    {
      title: this.i18n.fanyi("confirmLocationFlag"), 
      index: 'confirmLocationFlag' , width: 200, type: 'yn' 
    },    
    {
      title: this.i18n.fanyi("confirmLocationCodeFlag"), 
      index: 'confirmLocationCodeFlag' , width: 200, type: 'yn' 
    },    
    {
      title: this.i18n.fanyi("confirmLpnFlag"), 
      index: 'confirmLpnFlag' , width: 200, type: 'yn' 
    },      
    {
      title: this.i18n.fanyi("action"),  
      
      render: 'actionColumn', 
      width: 150,
      fixed: 'right',
    }
  ];  
  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private pickConfirmStrategyService: PickConfirmStrategyService,

    private itemFamilyService: ItemFamilyService, 
    private messageService: NzMessageService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute
  ) { 
    userService.isCurrentPageDisplayOnly("/outbound/pick-confirm-strategy").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                  
  }

  resetForm(): void {
    this.searchForm.reset();
    this.pickConfirmStrategies = []; 
  }

  search(sequence?: number): void {
    this.isSpinning = true;
    this.searchResult = '';
    this.pickConfirmStrategyService.getPickConfirmStrategies(
      sequence,      
      undefined,
      this.searchForm.value.itemName,
      this.searchForm.value.itemFamily,
    ).subscribe({
      next: (pickConfirmStrategyRes) => {

        this.pickConfirmStrategies = pickConfirmStrategyRes; 
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: pickConfirmStrategyRes.length,
        });
      }, 
      error: () => {
        
        this.searchResult = '';
        this.isSpinning = false;
      }
    });
  }
 


  ngOnInit(): void {
     
    this.initSearchForm();

    
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['sequence']) { 
        this.search(params['sequence']);
      } 
    }); 
  }

  initSearchForm(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      itemFamily: [null],
      itemName: [null],
    });

    this.itemFamilyService.loadItemFamilies().subscribe((itemFamilyRes: ItemFamily[]) => {
      this.itemFamilies = itemFamilyRes;
    });
  }

  removePickConfirmStrategy(pickConfirmStrategy: PickConfirmStrategy) {
    this.isSpinning = true;
    this.pickConfirmStrategyService.removePickConfirmStrategy(pickConfirmStrategy)
    .subscribe({
      next: () => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        setTimeout(() => {
          this.isSpinning = false; 
          this.search();
        }, 500);
      }, 
      error: () => this.isSpinning = false
    })
  }
  
  processItemQueryResult(selectedItemName: any): void {  
    this.searchForm.value.item.setValue(selectedItemName);
    
    
  }
}
