import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
    selector: 'app-work-order-work-order-line-complete-confirm',
    templateUrl: './work-order-line-complete-confirm.component.html',
    standalone: false
})
export class WorkOrderWorkOrderLineCompleteConfirmComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
