import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
    selector: 'app-inventory-movement-path-confirm',
    templateUrl: './movement-path-confirm.component.html',
    standalone: false
})
export class InventoryMovementPathConfirmComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
