import { Component, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { UnitOfMeasure } from '../../common/models/unit-of-measure';
import { BillableActivityType } from '../models/billable-activity-type';
import { BillableActivityTypeService } from '../services/billable-activity-type.service';

@Component({
    selector: 'app-billing-billable-activity-type',
    templateUrl: './billable-activity-type.component.html',
    styleUrls: ['./billable-activity-type.component.less'],
    standalone: false
})
export class BillingBillableActivityTypeComponent implements OnInit {
 

  // Table data for display
  billableActivityTypes: BillableActivityType[] = []; 
  
  @ViewChild('st', { static: false })
  st!: STComponent;
  columns: STColumn[] = [    
    { title: this.i18n.fanyi("name"),  index:"name"  }, 
    { title: this.i18n.fanyi("description"),  index:"description"  }, 
    {
      title: this.i18n.fanyi("action"),  
      buttons: [ 
        {
          text: this.i18n.fanyi("remove"),  
          type: 'link',
          click: (_record) => this.removeBillableActiviteType(_record),
        }
      ], 
      width: 150,
      fixed: 'right',
    }
  ]; 

  
  isSpinning = false;
  displayOnly = false;
  constructor(
    private billableActivityTypeService: BillableActivityTypeService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private userService: UserService,
    private messageService: NzMessageService,
  ) { 
    userService.isCurrentPageDisplayOnly("/billing/billable-activity-type").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );         
  }
  ngOnInit(): void { 
    this.search(true);
  }

  search(refresh: boolean = false): void {
    this.isSpinning = true;
    this.billableActivityTypeService.loadBillableActivityTypes(refresh).subscribe({
      next: (billableActivityTypeRes) => {
        this.billableActivityTypes = billableActivityTypeRes;
        this.isSpinning = false;

      }, 
      error: () => this.isSpinning = false
    });
  }
    

  removeBillableActiviteType(billableActivityType: BillableActivityType): void {
    this.isSpinning = true;
    this.billableActivityTypeService.removeBillableActivityType(billableActivityType)
    .subscribe({
      next: () => {

        this.messageService.success(this.i18n.fanyi("message.action.success"));
        this.isSpinning = false;
        this.search(true);
      }, 
      error: () => this.isSpinning = false
    })
  } 
   
  refresh(): void {
    this.search(true);
  }

}
