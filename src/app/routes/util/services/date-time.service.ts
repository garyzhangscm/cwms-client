import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateTimeService {

  constructor() { }
  
  getISODateTimeString(dateTime: Date) : string {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    
    var localISOTime = (new Date(dateTime.valueOf() - tzoffset)).toISOString().slice(0, -1);
    return localISOTime;
  }

  getISODateString(dateTime: Date) : string {
    return this.getISODateTimeString(dateTime).substring(0, 10);
  }
}
