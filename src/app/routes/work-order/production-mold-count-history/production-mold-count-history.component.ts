import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-work-order-production-mold-count-history',
  templateUrl: './production-mold-count-history.component.html',
})
export class WorkOrderProductionMoldCountHistoryComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
