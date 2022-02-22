import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-common-tractor-maintenance',
  templateUrl: './tractor-maintenance.component.html',
})
export class CommonTractorMaintenanceComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
