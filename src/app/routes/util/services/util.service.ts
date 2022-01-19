import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  // a helper function to compare 2 date times. When 
  // the date time returned from server is a LocalDateTime, then
  // in the angular, we will get a number array of 6 items
  // index                value
  // 0                    year
  // 1                    month
  // 2                    day
  // 3                    hour
  // 4                    minute
  // 5                    second
  compareDateTime(dateTime1: number[], dateTime2: number[]): number{

    const indexList = [0, 1, 2, 3, 4, 5];
    for (let i = 0; i < indexList.length; i++) { 
      if (dateTime1[i] !== dateTime2[i]) {
        return dateTime1[i] - dateTime2[i];
      }
    }
    return 0;  
  }
  
  compareBoolean(a?: boolean, b?: boolean): number{

    if (a === null || a === undefined) {
      a = false;
    }
    if (b === null || b === undefined) {
      b = false;
    }
    if (a === b) {
      return 0;
    }
    else if (a === true) {
      return 1;
    }
    else {
      return -1;
    }
   }
   compareNullableObjField(a: any, b: any, fieldName: string): number {
     if (a === undefined || a === null) {
       return -1;
     }
     else  if (b === undefined || b === null) {
       return 1;
     }
     else {
       let aValue = null;
       let bValue = null;
       Object.keys(a).filter(keyName => keyName === fieldName).forEach(keyName => aValue = a[keyName]);
       Object.keys(b).filter(keyName => keyName === fieldName).forEach(keyName => bValue = b[keyName]);
       if (aValue === null) {
         return -1;
       }
       else if (bValue === null) {
         return 1;
       }
       else {
         // convert to string and compare
         aValue = `${aValue  }`;
         bValue = `${bValue  }`;
         return aValue.localeCompare(bValue);
       }

     }
   }
   
   compareNullableNumber(a?: number, b?: number): number {
     if (a === undefined || a === null) {
       return -1;
     }
     else if (b === undefined || b === null)  {
       return 1;
     }
     else {
       return a - b; 
     }
   }
   
   compareNullableString(a?: string, b?: string): number {
    if (a === undefined || a === null) {
      return -1;
    }
    else if (b === undefined || b === null)  {
      return 1;
    }
    else {
      return a.localeCompare(b);
    }
  }
}
