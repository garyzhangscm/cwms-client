import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-inventory-trigger-replenishment-config',
  templateUrl: './trigger-replenishment-config.component.html',
})
export class InventoryTriggerReplenishmentConfigComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
