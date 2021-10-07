import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-qc-inspect-inventory',
  templateUrl: './inspect-inventory.component.html',
})
export class QcInspectInventoryComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
