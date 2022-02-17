import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-common-trailer',
  templateUrl: './trailer.component.html',
})
export class CommonTrailerComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
