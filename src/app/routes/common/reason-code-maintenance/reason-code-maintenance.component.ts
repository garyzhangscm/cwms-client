import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-common-reason-code-maintenance',
  templateUrl: './reason-code-maintenance.component.html',
})
export class CommonReasonCodeMaintenanceComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
