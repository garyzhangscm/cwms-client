import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-work-order-mps',
  templateUrl: './mps.component.html',
})
export class WorkOrderMpsComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
