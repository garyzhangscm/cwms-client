import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-transportation-easy-post',
  templateUrl: './easy-post.component.html',
})
export class TransportationEasyPostComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
