import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { Client } from '../../common/models/client';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { ListPickConfiguration } from '../models/list-pick-configuration';
import { PickType } from '../models/pick-type.enum';
import { ListPickConfigurationService } from '../services/list-pick-configuration.service';

@Component({
    selector: 'app-outbound-list-pick-configuration',
    templateUrl: './list-pick-configuration.component.html',
    styleUrls: ['./list-pick-configuration.component.less'],
    standalone: false
})
export class OutboundListPickConfigurationComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  isSpinning = false;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
     
    { title: this.i18n.fanyi("sequence"),  index: 'sequence'   },    
    { title: this.i18n.fanyi("pickType"),  index: 'pickType'   },    
    {
      title: this.i18n.fanyi("client"),  
      render: 'clientColumn', 
    },   
    {
      title: this.i18n.fanyi("customer"),  
      render: 'customerColumn', 
    },  
    { title: this.i18n.fanyi("groupRules"),  
        render: 'groupRulesColumn',  },    
    { title: this.i18n.fanyi("maxVolume"),   
    render: 'maxVolumeColumn',   },    
    { title: this.i18n.fanyi("maxWeight"),   
    render: 'maxWeightColumn',   },    
    { title: this.i18n.fanyi("maxPickCount"),   index: 'maxPickCount'  },    
    { title: this.i18n.fanyi("maxQuantity"),   index: 'maxQuantity'  },    
    { title: this.i18n.fanyi("allowLPNPick"),   index: 'allowLPNPick'  },    
    { title: this.i18n.fanyi("enabled"),  index: 'enabled'   },  
    {
      title: this.i18n.fanyi("action"),  
      render: 'actionColumn', 
      iif: () => !this.displayOnly
    }
  ]; 
   
  
  searchForm!: UntypedFormGroup;
  listPickConfigurations: ListPickConfiguration[] = [];
  searchResult = ""; 
  
  pickTypes = PickType;
  pickTypesKeys = Object.keys(this.pickTypes);
   
  clients: Client[] = [];
  
  displayOnly = false;
  constructor(private http: _HttpClient, 
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private listPickConfigurationService: ListPickConfigurationService,
    private messageService: NzMessageService,
    private router: Router, 
    private userService: UserService,
    private localCacheService: LocalCacheService,
    private fb: UntypedFormBuilder,) { 
      userService.isCurrentPageDisplayOnly("/outbound/list-pick-configuration").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                        
    }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.list-pick-configuration'));
    // initiate the search form
    this.searchForm = this.fb.group({
      pickType: [null], 
      customer: [null], 
      client: [null], 

    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['pickType'] || params['customer'] || params['client']) {
        this.searchForm.value.pickType.setValue(params['pickType']); 
        this.searchForm.value.customer.setValue(params['customer']); 
        this.searchForm.value.client.setValue(params['client']); 
        this.search();
      }
    });
  }

    
  resetForm(): void {
    this.searchForm.reset();
    this.listPickConfigurations = []; 
  }
  search(): void {
    this.isSpinning = true; 


    this.listPickConfigurationService
      .getAll(this.searchForm.value.pickType, undefined, undefined, 
        this.searchForm.value.customer, this.searchForm.value.client)
      .subscribe({

        next: (listPickConfigurationRes) => {
          this.listPickConfigurations = listPickConfigurationRes;
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: listPickConfigurationRes.length
          });
          this.loadListPickConfigurationDetails(this.listPickConfigurations);


        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  } 

  
  removeListPickConfiguration(listPickConfiguration: ListPickConfiguration) : void{
    
    this.listPickConfigurationService.remove(listPickConfiguration.id!).subscribe({
      next: () => {
        
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search();
      }
    });
    
  }

  loadListPickConfigurationDetails(listPickConfigurations: ListPickConfiguration[]) {

    listPickConfigurations.forEach(
      listPickConfiguration => {
        this.loadCustomer(listPickConfiguration);
      }
    )
  }
  
  loadCustomer(listPickConfiguration: ListPickConfiguration) {
      
    if (listPickConfiguration.customerId && listPickConfiguration.customer == null) {
      this.localCacheService.getCustomer(listPickConfiguration.customerId).subscribe(
        {
          next: (res) => {
            listPickConfiguration.customer = res; 
          }
        }
      );          
    } 
  }

}
