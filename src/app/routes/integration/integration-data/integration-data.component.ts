import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-integration-integration-data',
  templateUrl: './integration-data.component.html',
  styleUrls: ['./integration-data.component.less'],
})
export class IntegrationIntegrationDataComponent implements OnInit {
  constructor(private http: _HttpClient) {}

  ngOnInit() {}

  refreshData(index: number) {
    console.log(`index ${index} selected!`);
  }
}
