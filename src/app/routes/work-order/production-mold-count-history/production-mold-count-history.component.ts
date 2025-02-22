import { formatDate } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service'; 
import { PulseCountHistoryByItem } from '../models/pulse-count-history-by-item'; 
import { LightMesService } from '../services/light-mes.service';

@Component({
    selector: 'app-work-order-production-mold-count-history',
    templateUrl: './production-mold-count-history.component.html',
    styleUrls: ['./production-mold-count-history.component.less'],
    standalone: false
})
export class WorkOrderProductionMoldCountHistoryComponent implements OnInit {

  
  private i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private lightMesService: LightMesService,
    private userService: UserService,
    private messageService: NzMessageService,
    ) { 

      userService.isCurrentPageDisplayOnly("/work-order/production-mold-count-history").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                                  
  }

  pulseCountHistoryByItems: PulseCountHistoryByItem[] = []; 

  searchResult = '';
  isSpinning = false;
  searchForm!: UntypedFormGroup; 

  ngOnInit(): void { 

    this.searchForm = this.fb.group({
      dateTimeRanger: [null],  
      itemName: [null],  
    }); 
 

  } 

  resetForm(): void {
    this.searchForm.reset();
    this.pulseCountHistoryByItems = [];


  }
  
  search(): void {
    this.isSpinning = true;
    this.searchResult = '';
     
    
    let startTime : Date = this.searchForm.value.dateTimeRanger ? 
        this.searchForm.value.dateTimeRanger.value[0] : undefined; 
    let endTime : Date = this.searchForm.value.dateTimeRanger ? 
        this.searchForm.value.dateTimeRanger.value[1] : undefined; 

    if (startTime == null || endTime == null) {
      this.isSpinning = false;
      this.messageService.error("please select the time range");
      return;
    }
    this.lightMesService.getPulseCountHistory(
      startTime, endTime, 
      this.searchForm.value.itemName
    ).subscribe(
      {
        next: (pulseCountHistoryByItemRes) => {
          this.pulseCountHistoryByItems = pulseCountHistoryByItemRes;

          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
              currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
              rowCount: pulseCountHistoryByItemRes.length,
              });
        }, 
        error: () => this.isSpinning = false
      });

      
  }
 
  columns: STColumn[] = [

    { title: this.i18n.fanyi("item"), index: 'itemName',  },
    { title: this.i18n.fanyi("count"), index: 'count',  },
    

  ]; 
 

  processItemQueryResult(selectedItemName: any): void { 
    this.searchForm.value.itemName.setValue(selectedItemName);
  }
}
