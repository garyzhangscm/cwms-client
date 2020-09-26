import { Injectable, Input, Directive } from '@angular/core';
import { AsyncValidator, AbstractControl, ValidationErrors, NG_VALIDATORS, NG_ASYNC_VALIDATORS } from '@angular/forms';
import { SystemControlledNumberService } from '../common/services/system-controlled-number.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ValidatorServiceService } from '../common/services/validator-service.service';

@Directive({
  selector: '[appNewNumberValidator]',
  providers: [{ provide: NG_ASYNC_VALIDATORS, useExisting: NewNumberValidator, multi: true }],
})
export class NewNumberValidator implements AsyncValidator {
  @Input() variable: string;

  constructor(private validatorServiceService: ValidatorServiceService) {
    console.log(`NewNumberValidator created for ${this.variable}`);
  }

  validate(ctrl: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    if (ctrl.value === null) {
      return of(null);
    }
    console.log(`start validating! ${this.variable} with value: ${ctrl.value}`);
    return this.validatorServiceService.validateNewNumber(this.variable, ctrl.value).pipe(
      map(errorCode => {
        return errorCode !== '' ? { errorCode } : null;
      }),
      catchError(() => {
        console.log(`not able to validate ${this.variable} with value: ${ctrl.value}, assume it is valid`);
        return of(null);
      }),
    );
  }
}
