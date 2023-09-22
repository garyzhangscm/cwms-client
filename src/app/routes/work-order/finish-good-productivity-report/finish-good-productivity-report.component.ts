import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-work-order-finish-good-productivity-report',
  templateUrl: './finish-good-productivity-report.component.html',
})
export class WorkOrderFinishGoodProductivityReportComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
