import { Component, inject, OnInit, ViewChild } from '@angular/core'; 
import { I18NService } from '@core';
import { STComponent, STColumn, STColumnFilterMenu } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

import { UserService } from '../../auth/services/user.service'; 
import { ReasonCode } from '../models/reason-code';
import { ReasonCodeType } from '../models/reason-code-type.enum';
import { ReasonCodeService } from '../services/reason-code.service';

@Component({
    selector: 'app-common-reason-code',
    templateUrl: './reason-code.component.html',
    standalone: false
})
export class CommonReasonCodeComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  reasonCodeTypes = ReasonCodeType;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [ 
    { title: this.i18n.fanyi("name"),  index: 'name' , }, 
    { title: this.i18n.fanyi("description"),  index: 'description' , }, 
    { title: this.i18n.fanyi("type"),  render: 'typeColumn' ,index: 'type' , 
      filter: {
        menus:
          Object.values(ReasonCodeType).filter((reasonCodeType) => isNaN(Number(reasonCodeType)))
          .map((reasonCodeType) => {
            return {
              text: this.i18n.fanyi( `REASON-CODE-TYPE-${reasonCodeType}`),
              value: reasonCodeType
            } as STColumnFilterMenu;
          }),
        fn: (filter, record) => !filter.value || record.type == filter.value 
        /**
         * 
         * 
        [
          { text: '中国', value: 'CH' },
          { text: '美国', value: 'US' },
          { text: '德国', value: 'DE' },
        ],
         */
      },
    },  
    {
      title: this.i18n.fanyi("action"),  
      render: 'actionColumn', 
      iif: () => !this.displayOnly
    }
  ]; 
  
  reasonCodes: ReasonCode[] = [];
  displayOnly = false;
  isSpinning = false;


  constructor( 
    private reasonCodeService: ReasonCodeService,  
    private userService: UserService) { 
      userService.isCurrentPageDisplayOnly("/common/reason-code").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );        
    }
 
   ngOnInit(): void {
      this.search(true);
   } 
   refresh(): void {
      this.search(true);
   }
   search(refresh: boolean = false): void {
    this.isSpinning = true;
    this.reasonCodeService.loadReasonCode(refresh).subscribe({
      next: (reasonCodeRes) => {
          this.reasonCodes = reasonCodeRes;
          this.isSpinning = false;
      }, 
      error: () =>  this.isSpinning = false 
    });
   }

   removeReasonCode(reasonCode : ReasonCode) : void{
    
    this.isSpinning = true;
    this.reasonCodeService.removeReasonCode(reasonCode.id!).subscribe({
      next: () => { 
        this.isSpinning = false;
        this.refresh();
      }, 
      error: () => {
        this.isSpinning = false;
        
        this.refresh();
      }
    });
   }
}
