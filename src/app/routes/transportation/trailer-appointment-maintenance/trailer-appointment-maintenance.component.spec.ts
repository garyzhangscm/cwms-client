import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportationTrailerAppointmentMaintenanceComponent } from './trailer-appointment-maintenance.component';

describe('TransportationTrailerAppointmentMaintenanceComponent', () => {
  let component: TransportationTrailerAppointmentMaintenanceComponent;
  let fixture: ComponentFixture<TransportationTrailerAppointmentMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransportationTrailerAppointmentMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransportationTrailerAppointmentMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
