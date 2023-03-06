
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
  
  getLocalDateString(dateTime: Date) : string { 
    return `${dateTime.getFullYear()  }-${  dateTime.getMonth() + 1 }-${  dateTime.getDate()}`;
  } 
  
  getDayStartTime(date: Date) : Date { 
    return new Date(`${date.getFullYear()}-${  date.getMonth() + 1}-${date.getDate()}T00:00:00`);
  } 
  getDayEndTime(date: Date) : Date { 
    return new Date(`${date.getFullYear()}-${  date.getMonth() + 1}-${date.getDate()}T23:59:00`);
  } 
}
