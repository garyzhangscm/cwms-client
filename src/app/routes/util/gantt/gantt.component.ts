import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { gantt } from "dhtmlx-gantt";

import { GanttLink } from '../models/gantt-link';
import { GanttTask } from '../models/gantt-task';
import { GanttLinkService } from '../services/gantt-link.service';
import { GanttTaskService } from '../services/gantt-task.service';


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'gantt',
  styleUrls: ['./gantt.component.less'], 
  template: `<div #gantt_here class='gantt-chart'></div>`,
})
export class UtilGanttComponent implements OnInit {

  @Input() data: GanttTask[] | undefined;
  @Input() links: GanttLink[] | undefined;

  @ViewChild("gantt_here", { static: true }) ganttContainer!: ElementRef;
  constructor(private http: _HttpClient, 
    private ganttTaskService: GanttTaskService, private ganttLinkService: GanttLinkService) { }

  ngOnInit(): void { 
    gantt.config.xml_date = "%Y-%m-%d %H:%i";

    gantt.init(this.ganttContainer.nativeElement);
 /*
    Promise.all([this.ganttTaskService.get(), this.ganttLinkService.get()])
        .then(([data, links]) => {
            gantt.parse({data, links});
        }); 
   */  
 /*
    gantt.parse({data: [
      {id: 1, text: "Task #1", start_date: "2017-04-15 00:00", duration: 3, progress: 0.6},
      {id: 2, text: "Task #2", start_date: "2017-04-18 00:00", duration: 3, progress: 0.4}
      ]   , links: [ ]});
   */  
    console.log(`gantt.parse:\n ${JSON.stringify(this.data)}`)
    gantt.parse({data:  this.data, links: [ ]});
  }

}
