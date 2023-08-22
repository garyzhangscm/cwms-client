import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STColumnFilterMenu } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

import { UserService } from '../../auth/services/user.service';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { ReasonCode } from '../models/reason-code';
import { ReasonCodeType } from '../models/reason-code-type.enum';
import { ReasonCodeService } from '../services/reason-code.service';

@Component({
  selector: 'app-common-reason-code',
  templateUrl: './reason-code.component.html',
})
export class CommonReasonCodeComponent implements OnInit {

  reasonCodeTypes = ReasonCodeType;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [ 
    { title: this.i18n.fanyi("name"),  index: 'name' , }, 
    { title: this.i18n.fanyi("description"),  index: 'description' , }, 
    { title: this.i18n.fanyi("type"),  index: 'type' , 
      filter: {
        menus:
          Object.values(ReasonCodeType).filter((reasonCodeType) => isNaN(Number(reasonCodeType)))
          .map((reasonCodeType) => {
            return {
              text: reasonCodeType,
              value: reasonCodeType
            } as STColumnFilterMenu;
          }) 
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


  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
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
    
    this.reasonCodeService.loadReasonCode(true).subscribe({
      next: (reasonCodeRes) => {
          this.reasonCodes = reasonCodeRes;
      }
      

    });
   }
}
