import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { RF } from '../models/rf';
import { RfService } from '../services/rf.service';

@Component({
  selector: 'app-util-rf',
  templateUrl: './rf.component.html',
  styleUrls: ['./rf.component.less']
})
export class UtilRfComponent implements OnInit {

  isSpinning = false;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("rfCode"),  index: 'rfCode' , }, 
    { title: this.i18n.fanyi("printer"),  index: 'printerName' , }, 
    {
      title: this.i18n.fanyi("action"),  
      buttons: [ 
        {
          text: this.i18n.fanyi("remove"),  
          type: 'link',
          click: (_record) => this.removeRF(_record)
        }
      ]
    }
  ]; 

  
  searchForm!: UntypedFormGroup;
  rfs: RF[] = [];
  searchResult = "";
   
  displayOnly = false;
  constructor( 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private rfService: RfService,
    private messageService: NzMessageService,
    private userService: UserService,
    private fb: UntypedFormBuilder,) {
      userService.isCurrentPageDisplayOnly("/util/rf").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                       
     }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.util.rf'));
    // initiate the search form
    this.searchForm = this.fb.group({
      rfCode: [null]
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.rfCode) {
        this.searchForm.controls.rfCode.setValue(params.rfCode);
        this.search();
      }
    });}

    
  resetForm(): void {
    this.searchForm.reset();
    this.rfs = []; 
  }
  search(): void {
    this.isSpinning = true; 
    this.rfService
      .getRFs(this.searchForm.value.rfCode)
      .subscribe({

        next: (rfRes) => {
          this.rfs = rfRes;
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: rfRes.length
          });

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }
 
  removeRF(rf: RF) : void{
    this.isSpinning = true; 
    this.rfService.removeRf(rf).subscribe({

      next: () => { 
        this.isSpinning = false; 
        this.messageService.success(this.i18n.fanyi('message.remove.success'));
        this.search();

      },
      error: () => {
        this.isSpinning = false; 
      }
    });
    
  }
}
