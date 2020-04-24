import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-integration-integration-data-inventory-status-change',
  templateUrl: './integration-data-inventory-status-change.component.html',
})
export class IntegrationIntegrationDataInventoryStatusChangeComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
