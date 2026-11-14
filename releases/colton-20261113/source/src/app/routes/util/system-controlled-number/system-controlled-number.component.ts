import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service'; 
import { SystemControlledNumber } from '../models/system-controlled-number';
import { SystemControlledNumberService } from '../services/system-controlled-number.service';

@Component({
    selector: 'app-util-system-controlled-number',
    templateUrl: './system-controlled-number.component.html',
    styleUrls: ['./system-controlled-number.component.less'],
    standalone: false
})
export class UtilSystemControlledNumberComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  isSpinning = false;

  @ViewChild('st', { static: true })
  st!: STComponent;

  columns: STColumn[] = [
    { title: this.i18n.fanyi("variable"), index: 'variable', iif: () => this.isChoose('variable'), },
    { title: this.i18n.fanyi("prefix"), index: 'prefix', iif: () => this.isChoose('prefix'), },
    { title: this.i18n.fanyi("postfix"), index: 'postfix', iif: () => this.isChoose('postfix'), },
    { title: this.i18n.fanyi("length"), index: 'length', iif: () => this.isChoose('length'), },
    { title: this.i18n.fanyi("currentNumber"), index: 'currentNumber', iif: () => this.isChoose('currentNumber'), },
    { title: this.i18n.fanyi("nextNumber"), index: 'nextNumber', iif: () => this.isChoose('nextNumber'), },
    { title: this.i18n.fanyi("rollover"), index: 'rollover', iif: () => this.isChoose('rollover'), },
  ];
  customColumns = [

    { label: this.i18n.fanyi("variable"), value: 'variable', checked: true },
    { label: this.i18n.fanyi("prefix"), value: 'prefix', checked: true },
    { label: this.i18n.fanyi("postfix"), value: 'postfix', checked: true },
    { label: this.i18n.fanyi("length"), value: 'length', checked: true },
    { label: this.i18n.fanyi("currentNumber"), value: 'currentNumber', checked: true },
    { label: this.i18n.fanyi("nextNumber"), value: 'nextNumber', checked: true },
    { label: this.i18n.fanyi("rollover"), value: 'rollover', checked: true },
  ];

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{
    console.log(`my model changed!\n ${JSON.stringify(this.customColumns)}`);
    if (this.st.columns !== undefined) {
      this.st.resetColumns({ emitReload: true });

    }
  }

  
  searchForm!: UntypedFormGroup;
  systemControlledNumbers: SystemControlledNumber[] = [];
  searchResult = "";
   
  displayOnly = false;
  constructor(  
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private systemControlledNumberService: SystemControlledNumberService,
    private messageService: NzMessageService,
    private userService: UserService,
    private fb: UntypedFormBuilder,) { 
      userService.isCurrentPageDisplayOnly("/util/system-controlled-number").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                           
    }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.util.sys-controlled-num'));
    // initiate the search form
    this.searchForm = this.fb.group({
      variable: [null]
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['variable']) {
        this.searchForm.value.variable.setValue(params['variable']);
        this.search();
      }
    });
  }

    
  resetForm(): void {
    this.searchForm.reset();
    this.systemControlledNumbers = []; 
  }
  search(): void {
    this.isSpinning = true; 
    this.systemControlledNumberService
      .getSystemControlledNumbers(this.searchForm.value.variable)
      .subscribe({

        next: (systemControlledNumberRes) => {
          this.systemControlledNumbers = systemControlledNumberRes;
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: systemControlledNumberRes.length
          });

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }
 
  removeSystemControlledNumber(systemControlledNumber: SystemControlledNumber) : void{
    this.isSpinning = true; 
    this.systemControlledNumberService.removeSystemControlledNumber(systemControlledNumber).subscribe({

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


