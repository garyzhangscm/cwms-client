import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
    selector: 'app-work-order-work-order-qc-inspection',
    templateUrl: './work-order-qc-inspection.component.html',
    standalone: false
})
export class WorkOrderWorkOrderQcInspectionComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
