import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
    selector: 'app-util-company-maintenance',
    templateUrl: './company-maintenance.component.html',
    standalone: false
})
export class UtilCompanyMaintenanceComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
