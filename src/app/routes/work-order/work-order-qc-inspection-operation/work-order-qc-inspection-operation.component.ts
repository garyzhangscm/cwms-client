import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
    selector: 'app-work-order-work-order-qc-inspection-operation',
    templateUrl: './work-order-qc-inspection-operation.component.html',
    standalone: false
})
export class WorkOrderWorkOrderQcInspectionOperationComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
