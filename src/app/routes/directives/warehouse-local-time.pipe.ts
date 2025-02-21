import { Pipe, PipeTransform } from '@angular/core';

import { DateTimeService } from '../util/services/date-time.service';
/*
 * Convert from UTC to warehouse local time
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
*/
@Pipe({
  standalone: true,
  name: 'warehouseLocalTime'
})
export class WarehouseLocalTime implements PipeTransform {
    constructor(private dateTimeService: DateTimeService ) { }

  transform(value: Date, format = 'YYYY-MM-DD HH:mm:ss', localTimeZone?: string, ): string{ 
    if (value == null) { 
      return "";
    }  

    return this.dateTimeService.convertTimeToWarehouseTimeZone(value).format(format);
  }
}