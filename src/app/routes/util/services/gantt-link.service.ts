import { Injectable } from '@angular/core';

import { GanttLink } from '../models/gantt-link';
 

@Injectable({
  providedIn: 'root'
})
export class GanttLinkService {

  constructor() { }
  get(): Promise<GanttLink[]> {
      return Promise.resolve([
          {id: 1, source: 1, target: 2, type: "0"}
      ]);
  }
  
}
