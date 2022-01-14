import { Injectable } from '@angular/core';

import { GanttTask } from '../models/gantt-task';

@Injectable({
  providedIn: 'root'
})
export class GanttTaskService {

  constructor() { }
  
  get(): Promise<GanttTask[]>{
      return Promise.resolve([
          {id: 1, text: "Task #1", start_date: "2017-04-15 00:00", duration: 3, progress: 0.6},
          {id: 2, text: "Task #2", start_date: "2017-04-18 00:00", duration: 3, progress: 0.4}
      ]);
  }
}
