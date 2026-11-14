import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute,  } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 

import { UserService } from '../../auth/services/user.service';
import { Printer } from '../models/printer';
import { PrinterType } from '../models/printer-type';
import { PrinterTypeService } from '../services/printer-type.service';
import { PrinterService } from '../services/printer.service';

@Component({
    selector: 'app-report-printer',
    templateUrl: './printer.component.html',
    styleUrls: ['./printer.component.less'],
    standalone: false
})
export class ReportPrinterComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  isSpinning = false;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [ 
    
    { title: this.i18n.fanyi("name"),  index: 'name' , }, 
    { title: this.i18n.fanyi("description"),  index: 'description' , }, 
    { title: this.i18n.fanyi("printer-type"),  index: 'printerType.name' , }, 
    { title: this.i18n.fanyi("printer.job-count"),  index: 'jobCount' , }, 
    { title: this.i18n.fanyi("printer.queued-jobs"),  render: 'queuedJobsColumn', }, 
    {
      title: 'action', 
      render: 'actionColumn',
      iif: () => !this.displayOnly
    },
  ];  
 
  
  searchForm!: UntypedFormGroup;
  printerTypes: PrinterType[] = [];
  printers: Printer[] = [];

  searchResult = "";
  
   
  displayOnly = false;
  constructor(  
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private printerTypeService: PrinterTypeService,
    private printerService: PrinterService, 
    private userService: UserService,
    private fb: UntypedFormBuilder,) {
      userService.isCurrentPageDisplayOnly("/report/printer").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );          
     }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.report.printer'));
    // initiate the search form
    this.searchForm = this.fb.group({
      name: [null],
      printerType: [null],

    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['name']) {
        this.searchForm.value.name.setValue(params['name']); 
        this.search();
      }
    });

    // load all the valid printer types so the user is able to filter by
    // the type
    this.printerTypeService.getPrinterTypes().subscribe({
      next: (printerTypeRes) => this.printerTypes = printerTypeRes 
    })
  }

    
  resetForm(): void {
    this.searchForm.reset(); 
    this.printers = []; 
  }
  search(): void {
    this.isSpinning = true; 


    this.printerService
      .getPrinters(this.searchForm.value.name, this.searchForm.value.printerType)
      .subscribe({

        next: (printerRes) => {
          this.printers = printerRes;
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: printerRes.length
          });

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }

  removePrinter(printer: Printer): void {
    this.isSpinning = true; 
    this.printerService
      .removePrinter(printer)
      .subscribe({

        next: () => { 
          this.isSpinning = false;
          this.search();

        },
        error: () => {
          this.isSpinning = false; 
        }
      });
      
  }

}
