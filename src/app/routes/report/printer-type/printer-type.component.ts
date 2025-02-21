import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { PrinterType } from '../models/printer-type';
import { PrinterTypeService } from '../services/printer-type.service';

@Component({
    selector: 'app-report-printer-type',
    templateUrl: './printer-type.component.html',
    styleUrls: ['./printer-type.component.less'],
    standalone: false
})
export class ReportPrinterTypeComponent implements OnInit {
  isSpinning = false;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [ 
    
    { title: this.i18n.fanyi("name"),  index: 'name' , }, 
    { title: this.i18n.fanyi("description"),  index: 'description' , }, 
    {
      title: 'action', 
      render: 'actionColumn',
      iif: () => !this.displayOnly
    },
  ];  
 
  
  searchForm!: UntypedFormGroup;
  printerTypes: PrinterType[] = [];

  searchResult = "";
  
   
  displayOnly = false;
  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private printerTypeService: PrinterTypeService,
    private messageService: NzMessageService, 
    private userService: UserService,
    private fb: UntypedFormBuilder,) {
      userService.isCurrentPageDisplayOnly("/report/printer-type").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );           
     }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.report.printer-type'));
    // initiate the search form
    this.searchForm = this.fb.group({
      name: [null],

    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.name) {
        this.searchForm.controls.name.setValue(params.name); 
        this.search();
      }
    });
  }

    
  resetForm(): void {
    this.searchForm.reset();
    this.printerTypes = []; 
  }
  search(): void {
    this.isSpinning = true; 


    this.printerTypeService
      .getPrinterTypes(this.searchForm.value.name)
      .subscribe({

        next: (printerTypeRes) => {
          this.printerTypes = printerTypeRes;
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: printerTypeRes.length
          });

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }
  
  remove(printerType: PrinterType) : void {
    this.isSpinning = true;
    this.printerTypeService.removePrinterType(printerType).subscribe({
      next: () => {
        
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi(`message.access.success`));
        this.search();
        
      }, 
      error: () => this.isSpinning = false
    })
  }

}
