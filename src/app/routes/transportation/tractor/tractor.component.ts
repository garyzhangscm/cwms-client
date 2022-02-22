import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-common-tractor',
  templateUrl: './tractor.component.html',
})
export class CommonTractorComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
