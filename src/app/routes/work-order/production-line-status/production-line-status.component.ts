import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-work-order-production-line-status',
  templateUrl: './production-line-status.component.html',
})
export class WorkOrderProductionLineStatusComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
