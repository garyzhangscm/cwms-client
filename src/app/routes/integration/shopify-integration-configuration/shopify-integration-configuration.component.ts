import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-integration-shopify-integration-configuration',
  templateUrl: './shopify-integration-configuration.component.html',
})
export class IntegrationShopifyIntegrationConfigurationComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
