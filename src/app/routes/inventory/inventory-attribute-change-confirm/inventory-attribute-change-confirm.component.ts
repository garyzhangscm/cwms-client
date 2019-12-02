import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-inventory-inventory-attribute-change-confirm',
  templateUrl: './inventory-attribute-change-confirm.component.html',
})
export class InventoryInventoryAttributeChangeConfirmComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
