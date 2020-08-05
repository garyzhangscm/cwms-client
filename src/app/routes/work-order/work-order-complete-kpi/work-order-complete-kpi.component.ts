import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-work-order-work-order-complete-kpi',
  templateUrl: './work-order-complete-kpi.component.html',
})
export class WorkOrderWorkOrderCompleteKpiComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
