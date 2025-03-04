import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import {  ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 

import { UserService } from '../../auth/services/user.service';
import { ProductionLine } from '../models/production-line';
import { ProductionLineMonitor } from '../models/production-line-monitor';
import { ProductionLineMonitorService } from '../services/production-line-monitor.service';
import { ProductionLineService } from '../services/production-line.service';

@Component({
    selector: 'app-work-order-production-line-monitor',
    templateUrl: './production-line-monitor.component.html',
    styleUrls: ['./production-line-monitor.component.less'],
    standalone: false
})
export class WorkOrderProductionLineMonitorComponent implements OnInit {
  private i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  searchForm!: UntypedFormGroup;
  searching = false;
  searchResult = '';
  listOfProductionLineMonitors: ProductionLineMonitor[] = [];
  availableProductionLines: ProductionLine[] = [];
  
  isSpinning = false;
  
  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
     
    { title: this.i18n.fanyi("name"),  index: 'name'   },    
    { title: this.i18n.fanyi("description"),  index: 'description'   },  
    { title: this.i18n.fanyi("production-line"),  index: 'productionLine.name'   },  
    {
      title: this.i18n.fanyi("lastHeartBeatTime"),  
      render: 'lastHeartBeatTimeColumn', 
    },
    {
      title: this.i18n.fanyi("action"),  
      render: 'actionColumn', 
      iif: () => !this.displayOnly
    }
  ]; 

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private productionLineMonitorService: ProductionLineMonitorService, 
    private productionLineService: ProductionLineService, 
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService, 
    private userService: UserService, ) {
      userService.isCurrentPageDisplayOnly("/work-order/production-line-monitor").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                                         
     }

  ngOnInit(): void {
      this.titleService.setTitle(this.i18n.fanyi('menu.main.work-order.production-line-monitor'));
      // initiate the search form
      this.searchForm = this.fb.group({
        name: [null],
        description: [null],
        productionLine: [null], 
      });
  
      // IN case we get the number passed in, refresh the display
      // and show the order information
      this.activatedRoute.queryParams.subscribe(params => {
        if (params['name']) {
          this.searchForm.value.name.setValue(params['name']);
          this.search();
        }
      });

      this.loadAllProductionLines();
  }

  loadAllProductionLines() : void {

    this.productionLineService.getProductionLines().subscribe(
      {
        next: (productionLineRes) => this.availableProductionLines = productionLineRes
      }
    )
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfProductionLineMonitors = []; 
  }

  search(): void {
    this.isSpinning = true;
    this.searchResult = '';
     

    this.productionLineMonitorService.getProductionLineMonitors(
      this.searchForm.value.name, 
      this.searchForm.value.description, 
      this.searchForm.value.productionLine, ).subscribe({

        next: (productionLineMonitorRes) => {
            this.listOfProductionLineMonitors = productionLineMonitorRes;
            this.isSpinning = false;
            this.searchResult = this.i18n.fanyi('search_result_analysis', {
              currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
              rowCount: productionLineMonitorRes.length,
            });
        
        },
        error: () => { 
            this.isSpinning = false;
            this.searchResult = ''; 
        }


    });
  }

  removeProductionLineMonitor(productionLineMonitor: ProductionLineMonitor) {
    this.isSpinning = true; 

    this.productionLineMonitorService.removeProductionLineMonitor(
      productionLineMonitor).subscribe({

        next: (res) => { 
            this.isSpinning = false;
            this.search();
        
        },
        error: () => { 
            this.isSpinning = false; 
        }


    });
  }
}
