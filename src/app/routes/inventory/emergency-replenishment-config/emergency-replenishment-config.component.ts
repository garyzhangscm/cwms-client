import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-inventory-emergency-replenishment-config',
  templateUrl: './emergency-replenishment-config.component.html',
})
export class InventoryEmergencyReplenishmentConfigComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
