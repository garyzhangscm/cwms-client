import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder , FormGroup } from '@angular/forms';
import { _HttpClient } from '@delon/theme';
import { gantt } from 'dhtmlx-gantt';
 
import { GanttLink } from '../../util/models/gantt-link';
import { GanttTask } from '../../util/models/gantt-task';
import { MasterProductionScheduleService } from '../services/master-production-schedule.service';


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-work-order-mps-view',
  templateUrl: './mps-view.component.html',
  styleUrls: ['./mps-view.component.less'], 
  // template: `<div #gantt_here class='gantt-chart'></div>`,
})
export class WorkOrderMpsViewComponent implements OnInit {
 
  @ViewChild("gantt_here", { static: true }) ganttContainer!: ElementRef;

  isSpinning = false;
  
  searchForm!: FormGroup;
  
  constructor(private http: _HttpClient, 
    private fb: FormBuilder,
    private masterProductionScheduleService: MasterProductionScheduleService) { }

  ngOnInit(): void { 
    
    this.searchForm = this.fb.group({
      number: [null],
      description: [null],
    });

    gantt.config.xml_date = "%Y-%m-%d %H:%i";

    gantt.init(this.ganttContainer.nativeElement);
    this.masterProductionScheduleService.getMPSsGanttView().then(
      (data) => {
        
           gantt.parse({data:  data, links: [ ]});
      }
    );
  }
  
  resetForm(): void {
    this.searchForm.reset();
    

  }
  
  search(): void {
    this.isSpinning = true; 
  }

}
