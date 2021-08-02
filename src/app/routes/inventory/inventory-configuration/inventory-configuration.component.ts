import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-inventory-inventory-configuration',
  templateUrl: './inventory-configuration.component.html',
})
export class InventoryInventoryConfigurationComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
