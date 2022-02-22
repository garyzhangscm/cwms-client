import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-transportation-trailer-appointment-maintenance',
  templateUrl: './trailer-appointment-maintenance.component.html',
})
export class TransportationTrailerAppointmentMaintenanceComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
