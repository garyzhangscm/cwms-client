import { AbstractControl, ValidatorFn } from '@angular/forms';

import { ItemDefaultPackageUOM } from '../inventory/models/item-default-package-UOM';


export function newDefaultItemUOMQuantityValidator(itemDefaultPackageUOMs: ItemDefaultPackageUOM[]): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    let quantityAllowed = true;
    if (control.value === null) {
      return null;
    }

    itemDefaultPackageUOMs.forEach(itemUnitOfMeasure => {
      if (itemUnitOfMeasure.quantity === control.value) {
        // we shouldn't have 2 UOM that have the same quantity
        // for the same package type
        quantityAllowed = false;
      } else if (itemUnitOfMeasure.quantity! > control.value && itemUnitOfMeasure.quantity! % control.value !== 0) {
        // the quantity of bigger UOM should be able to
        // devided evenly by the smaller UOM
        quantityAllowed = false;
      } else if (itemUnitOfMeasure.quantity! < control.value && control.value % itemUnitOfMeasure.quantity! !== 0) {
        // the quantity of bigger UOM should be able to
        // devided evenly by the smaller UOM
        quantityAllowed = false;
      }
    });
    return !quantityAllowed ? { errorCode: 'INVALID_QUANTITY' } : null;
  };
}
