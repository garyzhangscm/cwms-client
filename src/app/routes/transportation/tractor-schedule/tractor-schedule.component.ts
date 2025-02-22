import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { startOfDay, endOfDay,  isWithinInterval,parseISO, toDate  } from 'date-fns'; 

import { NzMessageService } from 'ng-zorro-antd/message';

import { DateTimeService } from '../../util/services/date-time.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Tractor } from '../models/tractor';
import { TractorAppointmentType } from '../models/tractor-appointment-type.enum';
import { TractorSchedule } from '../models/tractor-schedule';
import { TractorScheduleService } from '../services/tractor-schedule.service';
import { TractorService } from '../services/tractor.service'; 

@Component({
    selector: 'app-transportation-tractor-schedule',
    templateUrl: './tractor-schedule.component.html',
    styleUrls: ['./tractor-schedule.component.less'],
    standalone: false
})
export class TransportationTractorScheduleComponent implements OnInit { 
  pageTitle = '';
  addScheduleForm!: UntypedFormGroup;
  currentTractor!: Tractor;
  isSpinning = false;
  tractorAppointmentTypes = TractorAppointmentType;
  tractorSchedules: TractorSchedule[] = [];

  constructor(private http: _HttpClient,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private activatedRoute: ActivatedRoute,
    private tractorService: TractorService,
    private tractorScheduleService: TractorScheduleService,
    private messageService: NzMessageService,
    private titleService: TitleService, 
    private dateTimeService: DateTimeService,
    private warehouseService: WarehouseService,
    private fb: UntypedFormBuilder,) {
      this.titleService.setTitle(this.i18n.fanyi('tractor.schedule'));
      this.pageTitle = this.i18n.fanyi('tractor.schedule'); 
    }

  ngOnInit(): void {
    this.addScheduleForm = this.fb.group({
      checkInTime: [null], 
      dispatchTime: [null], 
      type: [null], 
      comment: [null], 
    });
 
    this.isSpinning = true;
    this.activatedRoute.queryParams.subscribe(params => { 
      if (params['id']) { 
        this.tractorService.getTractor(params['id']).subscribe(
          {
            next: (tractorRes) => {
              this.currentTractor = tractorRes; 
              this.isSpinning = false;
            }
          }
        )
        this.tractorScheduleService.getTractorSchedules(params['id']).subscribe({
          next: (tractorScheduleRes) => {

            this.tractorSchedules = tractorScheduleRes;
          }
        })
      } 
    }); 
  }

  resetForm(): void {
    this.addScheduleForm.reset(); 
  }
  addSchedule() {
    if (!this.addScheduleForm.value.type) {
      this.messageService.error(this.i18n.fanyi('field_required', {requiredFieldName: "type"}));
      return;
    }

    this.isSpinning = true;
    this.tractorScheduleService.addTractorSchedule(this.createTractorSchedule()).subscribe({
      next: (tractorScheduleRes) => {
        this.tractorSchedules = [...this.tractorSchedules, tractorScheduleRes];
        this.isSpinning = false;
      }
    })
  }
  createTractorSchedule() : TractorSchedule{
    console.log(`this.addScheduleForm.value.checkInTime: ${JSON.stringify(this.addScheduleForm.value.checkInTime)}`)
    const checkInTime = toDate(this.addScheduleForm.value.checkInTime);
    
    
    let timeZoneOffset = moment(this.addScheduleForm.value.checkInTime).tz(moment.tz.guess()).format('Z');
    let localCheckInTime = moment.utc(this.addScheduleForm.value.checkInTime).utcOffset(timeZoneOffset).format("YYYY-MM-DD HH:mm:ss");
    let localDispatchTime = moment.utc(this.addScheduleForm.value.dispatchTime).utcOffset(timeZoneOffset).format("YYYY-MM-DD HH:mm:ss");
 
    console.log(`timeZoneOffset : ${JSON.stringify(timeZoneOffset)}`)
    console.log(`localCheckInTime : ${JSON.stringify(localCheckInTime.substring(0, 20))}`)
    console.log(`localDispatchTime : ${JSON.stringify(localDispatchTime.substring(0, 20))}`)
    console.log(`check in time : ${JSON.stringify(moment.utc(localCheckInTime.substring(0, 20)).toDate())}`)
    console.log(`dispatch time : ${JSON.stringify(moment.utc(this.addScheduleForm.value.dispatchTime).utcOffset(timeZoneOffset).toDate())}`)
    

    return {      
      warehouseId: this.warehouseService.getCurrentWarehouse().id,

      tractor: this.currentTractor,
      
      // checkInTime: this.addScheduleForm.value.checkInTime,
      // dispatchTime: this.addScheduleForm.value.dispatchTime,
      checkInTime:  this.addScheduleForm.value.checkInTime,
      dispatchTime:   this.addScheduleForm.value.dispatchTime,
      type: this.addScheduleForm.value.type,
      comment: this.addScheduleForm.value.comment
    }
  }
  getTotalDailyScheduleCount(date: Date): number { 
    // return the tractor schedule that as least have check in time or dispatch time
    // setup and either check in before the compared date, or dispatched after
    // the compared date
    return this.geDailySchedule(date).length; 
  }
  
  geDailySchedule(date: Date): TractorSchedule[] { 
    let timeZoneOffset = moment(date).tz(moment.tz.guess()).format('Z');
    // return the tractor schedule that as least have check in time or dispatch time
    // setup and either check in before the compared date, or dispatched after
    // the compared date
    return this.tractorSchedules.filter(
              schedule => schedule.checkInTime || schedule.dispatchTime
            ).filter(
              schedule => {
                // check if the current date is within the check in and dispath time range
                // if there's no check in time, then make sure the dispatch time is on or 
                // before the date
                // if there's no dispatch time, then make sure the check in time is on or after
                // the date
                const checkInTime : Date = schedule.checkInTime ? 
                    schedule.checkInTime : startOfDay(
                      parseISO(moment.utc(schedule.dispatchTime).utcOffset(timeZoneOffset).format("YYYY-MM-DD"))
                    );
                const dispatchTime : Date  = schedule.dispatchTime ? 
                    schedule.dispatchTime : endOfDay(
                      parseISO(moment.utc(schedule.checkInTime).utcOffset(timeZoneOffset).format("YYYY-MM-DD"))
                    );
                      

                const interval: Interval = {

                  start:  parseISO(moment.utc(checkInTime).utcOffset(timeZoneOffset).format("YYYY-MM-DD")),
                  end:  parseISO(moment.utc(dispatchTime).utcOffset(timeZoneOffset).format("YYYY-MM-DD")),
                }  
                return isWithinInterval(date,  interval)
              }
            );
  }
  
}
