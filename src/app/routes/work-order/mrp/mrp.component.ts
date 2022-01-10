import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-work-order-mrp',
  templateUrl: './mrp.component.html',
})
export class WorkOrderMrpComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
