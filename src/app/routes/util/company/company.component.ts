import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-util-company',
  templateUrl: './company.component.html',
})
export class UtilCompanyComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
