import { Directive, Injectable, Input } from '@angular/core';
import { AbstractControl, AsyncValidator, NG_ASYNC_VALIDATORS, NG_VALIDATORS, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
 
import { ValidatorServiceService } from '../common/services/validator-service.service';

@Directive({
    selector: '[appNewNumberValidator]',
    providers: [{ provide: NG_ASYNC_VALIDATORS, useExisting: NewNumberValidator, multi: true }],
    standalone: false
})
export class NewNumberValidator implements AsyncValidator {
  @Input() variable: string | undefined;

  constructor(private validatorServiceService: ValidatorServiceService) {
    // console.log(`NewNumberValidator created for ${this.variable}`);
  }

  validate(ctrl: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    if (ctrl.value === null) {
      return of(null);
    }
    // console.log(`start validating! ${this.variable} with value: ${ctrl.value}`);
    return this.validatorServiceService.validateNewNumber(this.variable!, ctrl.value).pipe(
      map(errorCode => {
        return errorCode !== '' ? { errorCode } : null;
      }),
      catchError(() => {
        // console.log(`not able to validate ${this.variable} with value: ${ctrl.value}, assume it is valid`);
        return of(null);
      }),
    );
  }
}
