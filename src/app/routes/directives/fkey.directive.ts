import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

import { SystemControlledNumberService } from '../util/services/system-controlled-number.service';
 

@Directive({
    selector: '[appFkey]',
    standalone: false
})
export class FkeyDirective {
  @Input() variable = '';
  element: ElementRef;
  @Output() readonly nextNumberAvailableEvent = new EventEmitter<string>()

  constructor(element: ElementRef, private systemControlledNumberService: SystemControlledNumberService) {
    this.element = element;
  }
  @HostListener('keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Generate next number if the user press
    // key ` (key code is 96)
    // or key ~ (key code is 126)
    // console.log(`event.key: ${event.key}`);
    // console.log(`event.keyCode: ${event.keyCode}`);
    if (event.key !== undefined && event.key === '`') {
      this.generateNextNumber();
      event.preventDefault();
    } else if (event.keyCode !== undefined && event.keyCode === 96) {
      this.generateNextNumber();
      event.preventDefault();
    } else if (event.key !== undefined && event.key === '~') {
      this.generateNextNumber();
      event.preventDefault();
    } else if (event.keyCode !== undefined && event.keyCode === 126) {
      this.generateNextNumber();
      event.preventDefault();
    }
  }

  generateNextNumber(): void {
    if (this.variable) {
      this.systemControlledNumberService
        .getNextAvailableId(this.variable)
        .subscribe(nextId => {
          this.element.nativeElement.value = nextId;
          this.nextNumberAvailableEvent.emit(nextId);
        });
    }
  }
}
