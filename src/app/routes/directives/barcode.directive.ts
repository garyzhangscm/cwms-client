import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

import { SystemControlledNumberService } from '../util/services/system-controlled-number.service';
 

@Directive({
    selector: '[barcode]',
    host: {
        //  '(focus)': 'onFocus($event)',
        '(blur)': 'onBlur()',
        //  '(keyup)': 'onKeyup($event)',
        //  '(change)': 'onChange($event)',
        //  '(ngModelChange)': 'onNgModelChange($event)'
    },
    standalone: false
})
export class BarcodeDirective {
  @Input() variable = '';
  element: ElementRef;
  @Output() readonly nextNumberAvailableEvent = new EventEmitter<string>()

  constructor(element: ElementRef) {
    this.element = element; 
  } 

  onBlur(): void {
    if (this.variable) { 
      // console.log(`this.variable: ${this.variable}`);
      // console.log(`this.element.nativeElement.value: ${this.element.nativeElement.value}`);
      this.extractBarcodeValue(this.element.nativeElement.value, this.variable);
    }
  }

  extractBarcodeValue(barcode: string, variable: string) {
    if(this.validateBarcode(barcode)) {

      const barcodeContent = this.parseBarcode(barcode);
      // console.log(`barcodeContent: ${barcodeContent}`);
      let parameters = barcodeContent.split(";");
      // console.log(`parameters: ${parameters}`);
      parameters.forEach((parameter) => {
        var keyValue = parameter.split("=");
        // console.log(`>> parameter: ${parameter}`);
        // console.log(`>> keyValue: ${keyValue}`);
  
        if (keyValue.length == 2 && keyValue[0] == variable) { 
          this.element.nativeElement.value = keyValue[1];
          return;
        }
      });
    }
  }

  
  parseBarcode(barcode: string) {

    return barcode.substring(7);
  }

  validateBarcode(barcode: string) : boolean {
    if (barcode.toLowerCase().startsWith("qrcode:") ) {
      return true;
    }
    return false;
  }
}
