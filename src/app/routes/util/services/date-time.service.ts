import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateTimeService {

  constructor() { }
  
  getISODateTimeString(dateTime: Date) : string {
    // var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    
    // var localISOTime = (new Date(dateTime.valueOf() - tzoffset)).toISOString().slice(0, -1);

    // remove the millisecond
    // return `${dateTime.toISOString().slice(0, -5)}Z`;
    return  dateTime.toISOString();
  }

  getISODateString(dateTime: Date) : string {
    return this.getISODateTimeString(dateTime).substring(0, 10);
  } 
}
