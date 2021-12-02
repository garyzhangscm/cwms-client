import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-util-company-menu',
  templateUrl: './company-menu.component.html',
})
export class UtilCompanyMenuComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
