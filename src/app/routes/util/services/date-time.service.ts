
import { Injectable } from '@angular/core';
import moment from 'moment';

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

  getUTCHour(localHour: number) : number{
    var offset = new Date().getTimezoneOffset();
    console.log(`current time zone's offset: ${offset}`);
    return (localHour - offset / 60) % 24;
  }
  getLocalHour(utcHour: number) : number{
    var offset = new Date().getTimezoneOffset();
    console.log(`current time zone's offset: ${offset}`);
    return (utcHour + offset / 60) % 24;
  }
  
  getLocalDateString(dateTime: Date) : string { 
    return `${dateTime.getFullYear()  }-${  dateTime.getMonth() + 1 }-${  dateTime.getDate()}`;
  } 
  
  getDayStartTime(date: Date) : Date {  
    return new Date(`${date.getFullYear()}-${  date.getMonth() + 1}-${date.getDate()}`); 
  } 
  getDayEndTime(date: Date) : Date { 
    // console.log(`start get date via time zone ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);

    var date = new Date(`${date.getFullYear()}-${  date.getMonth() + 1}-${date.getDate()}`);
    return new Date(date.getTime() + 86400000 - 1);
  } 
   
}
