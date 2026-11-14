import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
    selector: 'app-inventory-inventory-move',
    templateUrl: './inventory-move.component.html',
    standalone: false
})
export class InventoryInventoryMoveComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
