import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message';

import { TrailerAppointment } from '../../transportation/models/trailer-appointment';
import { TrailerAppointmentStatus } from '../../transportation/models/trailer-appointment-status.enum';
import { TrailerAppointmentType } from '../../transportation/models/trailer-appointment-type.enum';
import { TrailerAppointmentService } from '../../transportation/services/trailer-appointment.service';

@Component({
  selector: 'app-outbound-load',
  templateUrl: './load.component.html',
  styleUrls: ['./load.component.less'],
})
export class OutboundLoadComponent implements OnInit {

  
  trailerAppointmentStatus = TrailerAppointmentStatus; 
  searchForm!: FormGroup;
  searchResult = '';
  listOfAllTrailerAppointments: TrailerAppointment[] = [];
  isSpinning = false;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [ 
    { title: this.i18n.fanyi("number"), index: 'number'  },   
    { title: this.i18n.fanyi("description"), index: 'description'  },   
    { title: this.i18n.fanyi("status"), index: 'status'  },  
    { title: this.i18n.fanyi("completedTime"), render: 'completedTimeColumn',},        
    {
      title: this.i18n.fanyi("action"), fixed: 'right',width: 210, 
      render: 'actionColumn',
    }, 
   
  ];

  constructor(private http: _HttpClient, 
    private trailerAppointmentService: TrailerAppointmentService,
    private titleService: TitleService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private messageService: NzMessageService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,) { }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.load'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      status: [null],
      dateTimeRanger: [null],
      date: [null],
    });

    // IN case we get the number passed in, refresh the display
    // and show the order information
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.number) {
        this.searchForm.controls.number.setValue(params.number);
        this.search();
      }
    });
  }
  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllTrailerAppointments = []; 

  }
  search() {
    this.isSpinning = true;
    
    let startTime : Date = this.searchForm.controls.dateTimeRanger.value ? 
        this.searchForm.controls.dateTimeRanger.value[0] : undefined; 
    let endTime : Date = this.searchForm.controls.dateTimeRanger.value ? 
        this.searchForm.controls.dateTimeRanger.value[1] : undefined; 
    let specificDate : Date = this.searchForm.controls.date.value;

    this.trailerAppointmentService.getTrailerAppointments(
      this.searchForm.controls.number.value, 
      TrailerAppointmentType.SHIPPING,
      this.searchForm.controls.status.value,
      startTime,  endTime, specificDate    
    ).subscribe(
      {
        next: (trailerApointmentRes) => {
          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: trailerApointmentRes.length,
          });
          
          this.listOfAllTrailerAppointments = trailerApointmentRes;  
        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        },
      }
    )

  }

  isLoadReadForCompletoade(trailerAppointment: TrailerAppointment): boolean {
    return trailerAppointment.status === TrailerAppointmentStatus.INPROCESS || 
           trailerAppointment.status === TrailerAppointmentStatus.PLANNED 
  }

  completeLoad(trailerAppointment: TrailerAppointment) {

    this.isSpinning = true;
    this.trailerAppointmentService.completeTrailerAppointment(
      trailerAppointment.id!  
    ).subscribe({
      next: () => {

        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search();
      },
      error: () => {
        this.isSpinning = false;
        this.searchResult = '';
      },
    });
  }
}
