import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
    selector: 'app-work-order-work-order-line-complete',
    templateUrl: './work-order-line-complete.component.html',
    standalone: false
})
export class WorkOrderWorkOrderLineCompleteComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
