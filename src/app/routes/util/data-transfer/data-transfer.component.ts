import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-util-data-transfer',
  templateUrl: './data-transfer.component.html',
})
export class UtilDataTransferComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
