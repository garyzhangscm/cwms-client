
import { Injectable } from '@angular/core';
// import * as moment from 'moment';
import moment from 'moment';
import 'moment-timezone';


import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';

@Injectable({
  providedIn: 'root' 
})
export class DateTimeService {

  constructor(private warehouseService: WarehouseService) { }
  
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
    return (localHour + offset / 60) % 24;
  }
  getLocalHour(utcHour: number) : number{
    var offset = new Date().getTimezoneOffset();
    console.log(`current time zone's offset: ${offset}`);
    return (utcHour - offset / 60) % 24;
  }
  
  getLocalDateString(dateTime: Date) : string { 
    return `${dateTime.getFullYear()  }-${  (`0${  dateTime.getMonth()+1}`).slice(-2)}-${  dateTime.getDate()}`;
  } 
  
  getDayStartTime(date: Date) : Date {  
    return new Date(`${date.getFullYear()}-${  date.getMonth() + 1}-${date.getDate()}`); 
  } 
  getDayEndTime(date: Date) : Date { 
    // console.log(`start get date via time zone ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);

    var date = new Date(`${date.getFullYear()}-${  date.getMonth() + 1}-${date.getDate()}`);
    return new Date(date.getTime() + 86400000 - 1);
  }  

  getCurrentTimeByWarehouseTimeZone() {
    return this.convertTimeToWarehouseTimeZone(new Date());

  }
  convertTimeToWarehouseTimeZone(time: Date) : moment.Moment {
 
    if (this.warehouseService.getCurrentWarehouse().timeZone) {
      var result = moment(time).tz(this.warehouseService.getCurrentWarehouse().timeZone!);
      // var result = moment.tz(time, this.warehouseService.getCurrentWarehouse().timeZone!); 
      return result;
    }
    else {
      var result = moment(time); 
      return result;
    }
  }

  getTimeWithTimeZone(time: string, timeFormat: string, timeZone?: string): moment.Moment{
    if (timeZone) {
      return moment.tz(time, timeFormat, timeZone);
    } 
    else {
      return moment(time); 
    }
  }

  getDaysInDifference(date1: Date, date2: Date): number {
 

    let days = Math.floor(
      (Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate()) - 
           Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate())
          ) /(1000 * 60 * 60 * 24));

    return days;
  }
   
}
