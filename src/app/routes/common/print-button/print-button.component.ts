import { Component, EventEmitter, inject, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder } from '@angular/forms'; 
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { Printer } from '../../report/models/printer';
import { PrintingStrategy } from '../../warehouse-layout/models/printing-strategy.enum';
import { WarehouseConfigurationService } from '../../warehouse-layout/services/warehouse-configuration.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service'; 
import { PrintingService } from '../services/printing.service';

@Component({
    selector: 'cwms-common-print-button',
    templateUrl: './print-button.component.html',
    standalone: false
})
export class CommonPrintButtonComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  @Input() printingInProcess: boolean = false;
  @Input() allowPreview: boolean = true;
  @Input() printButtonDisabled: boolean = false;
  @Input() defaultPhysicalCopyCount: number = 1;
  @Output() readonly print: EventEmitter<{ printerIndex: number, printerName: string, physicalCopyCount: number, collated: boolean }> = new EventEmitter();
  @Output() readonly preview: EventEmitter<any> = new EventEmitter();

  printerModal!: NzModalRef;
  printerForm!: UntypedFormGroup;
  availablePrinters: Printer[] = []; 

  constructor(private http: _HttpClient,
    private fb: UntypedFormBuilder,
    private modalService: NzModalService,
    private warehouseService: WarehouseService,
    private warehouseConfigurationService: WarehouseConfigurationService,
    private messageService: NzMessageService,
    private printingService: PrintingService) { }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {

  }


  openPrinterModal(
    tplPrinterModalTitle: TemplateRef<{}>,
    tplPrinterModalContent: TemplateRef<{}>,
  ): void {
    this.availablePrinters = [];

    this.printerForm = this.fb.group({
      printer: new UntypedFormControl({ value: 0, disabled: false }),
      physicalCopyCount: new UntypedFormControl({ value: this.defaultPhysicalCopyCount, disabled: false }),
      collated: new UntypedFormControl({ value: false, disabled: false }),
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
        let selectedPrinter = this.availablePrinters.find(element => {
          return +element.id! === +this.printerForm.value.printer
        });
        this.printReport(
          this.printerForm.value.printer,
          selectedPrinter === undefined ? "" : selectedPrinter.name,
          this.printerForm.value.physicalCopyCount,
          this.printerForm.value.collated,
          
        );
      },

      nzWidth: 1000,
    });
  }

  loadAvaiablePrinters(): void {
    console.log(`start to load avaiable printers`)
    this.warehouseConfigurationService.getWarehouseConfiguration().subscribe({
      next: (warehouseConfiguration) => {

        if (warehouseConfiguration.printingStrategy === PrintingStrategy.SERVER_PRINTER) {

          console.log(`will get printer from server`)
          this.printingService.getAllServerPrinters(warehouseConfiguration.printingStrategy).subscribe(printers => {
              
            printers.forEach(
              (printer, index) => {
                
                this.availablePrinters = [...this.availablePrinters, 
                  {
                      id: index, 
                      name: printer.name, 
                      description: printer.name, 
                      warehouseId: this.warehouseService.getCurrentWarehouse().id
                  }
                ];
                /*
                this.availablePrinters.push({
                  id: index, name: printer.name, description: printer.name, warehouseId: this.warehouseService.getCurrentWarehouse().id
                });
                */

              }); 
          })
        }         
        else  if (warehouseConfiguration.printingStrategy === PrintingStrategy.LOCAL_PRINTER_LOCAL_DATA ||
          warehouseConfiguration.printingStrategy === PrintingStrategy.LOCAL_PRINTER_SERVER_DATA) {
          
          console.log(`will get printer from local tools`)
          this.printingService.getAllLocalPrinters().forEach(
            (printer, index) => {
              this.availablePrinters.push({
                id: index, name: printer, description: printer, warehouseId: this.warehouseService.getCurrentWarehouse().id
              });

            });
        }
        else {
          
          this.messageService.error(this.i18n.fanyi('not-able-to-load-printers'));

        }
      }
    }) 

  }

  printReport(printerIndex: number, printerName: string, physicalCopyCount: number, collated: boolean): void {
    console.log(`print report from ${printerIndex}, name: ${printerName} copies: ${physicalCopyCount}, collated: ${collated}`)
    this.print.emit({ printerIndex, printerName, physicalCopyCount, collated });
  }
  previewReport(): void {
    this.preview.emit();
  }

  printByDefaultConfiguration(): void {
    // print 1 copy from default printer(index = -1)
    this.print.emit({ printerIndex: -1, printerName: "", physicalCopyCount: this.defaultPhysicalCopyCount, collated:false });

  }


}
