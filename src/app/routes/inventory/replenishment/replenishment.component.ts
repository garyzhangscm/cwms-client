import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-inventory-replenishment',
  templateUrl: './replenishment.component.html',
})
export class InventoryReplenishmentComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
