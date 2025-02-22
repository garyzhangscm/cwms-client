import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message'; 

import { UserService } from '../../auth/services/user.service';
import { ProductionLineType } from '../models/production-line-type';
import { ProductionLineTypeService } from '../services/production-line-type.service';

@Component({
    selector: 'app-work-order-production-line-type',
    templateUrl: './production-line-type.component.html',
    styleUrls: ['./production-line-type.component.less'],
    standalone: false
})
export class WorkOrderProductionLineTypeComponent implements OnInit {
  private i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  // Table data for display
  productionLineTypes: ProductionLineType[] = []; 
  isSpinning = false;
  
  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [

    { title: this.i18n.fanyi("name"), index: 'name',   },
    { title: this.i18n.fanyi("description"), index: 'description',  }, 
    {
      title: this.i18n.fanyi("action"), 
      render: 'actionColumn',
      iif: () => !this.displayOnly   
    },      
  ];

  displayOnly = false;
  constructor(
    private productionLineTypeService: ProductionLineTypeService,
    private messageService: NzMessageService,
    private userService: UserService,
  ) { 
    userService.isCurrentPageDisplayOnly("/work-order/production-line-type").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                
  }

  
  ngOnInit(): void {
    this.refresh();
  }

  search(): void {
    this.isSpinning = true;
    this.productionLineTypeService.getProductionLineTypes().subscribe({
      next: (productionLineTypeRes) => {
        this.productionLineTypes = productionLineTypeRes;
        this.isSpinning = false;
      },
      error: () => this.isSpinning = false
    });
  }  

  removeProductionLineType(type: ProductionLineType) {
    this.isSpinning = true;
    this.productionLineTypeService.removeProductionLineType(type).subscribe({
      next: () => { 
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("message.action.success"));
        this.search();
      },
      error: () => this.isSpinning = false
    });
  }
  refresh(): void{
    this.search();
  }
}
