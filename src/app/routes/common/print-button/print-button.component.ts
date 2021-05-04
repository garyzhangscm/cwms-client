import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { Printer } from '../models/printer';
import { PrintingService } from '../services/printing.service';

@Component({
  selector: 'cwms-common-print-button',
  templateUrl: './print-button.component.html',
})
export class CommonPrintButtonComponent implements OnInit {

  @Input() printingInProcess : boolean = false;
  @Input() allowPreview : boolean = true;
  @Input() printButtonDisabled: boolean = false;
  @Output() print: EventEmitter<{printerIndex: number, physicalCopyCount: number}> = new EventEmitter();
  @Output() preview: EventEmitter<any> = new EventEmitter();

  printerModal!: NzModalRef;
  printerForm!: FormGroup;
  availablePrinters: Printer[] = [];

  constructor(private http: _HttpClient,    
    private fb: FormBuilder,
    private i18n: I18NService,
    private modalService: NzModalService,
    private printingService: PrintingService) { }

  ngOnInit(): void { 
    
  }

  
  openPrinterModal(
    tplPrinterModalTitle: TemplateRef<{}>,
    tplPrinterModalContent: TemplateRef<{}>,
  ): void {

    this.printerForm = this.fb.group({
      printer: new FormControl({ value: 0, disabled: false }),
      physicalCopyCount: new FormControl({ value: 1, disabled: false }),
    });

    this.loadAvaiablePrinters();
    // Load the location
    this.printerModal = this.modalService.create({
      nzTitle: tplPrinterModalTitle,
      nzContent: tplPrinterModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.printerModal.destroy();
      },
      nzOnOk: () => {
        this.printReport(
          this.printerForm.controls.printer.value,
          this.printerForm.controls.physicalCopyCount.value,
        );
      },

      nzWidth: 1000,
    });
  }

  loadAvaiablePrinters() : void{
    this.printingService.getAllLocalPrinter().forEach(
      (printer, index) => {
        this.availablePrinters.push({
          id:  index,  name: printer
        });

      });
      
      //console.log(`availablePrinters: ${JSON.stringify(this.availablePrinters)}`);
    
  }

  printReport(printerIndex: number, physicalCopyCount: number): void{
    console.log(`print report from {printerIndex}, copies: {physicalCopyCount}`)
    this.print.emit({printerIndex, physicalCopyCount});
  }
  previewReport() :void{
    this.preview.emit();
  }

  printByDefaultConfiguration(): void{
    // print 1 copy from default printer(index = -1)
    this.print.emit({printerIndex: -1, physicalCopyCount: 1});

  }
  

}
