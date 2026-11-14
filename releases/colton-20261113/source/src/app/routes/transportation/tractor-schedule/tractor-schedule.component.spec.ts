import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportationTractorScheduleComponent } from './tractor-schedule.component';

describe('TransportationTractorScheduleComponent', () => {
  let component: TransportationTractorScheduleComponent;
  let fixture: ComponentFixture<TransportationTractorScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransportationTractorScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransportationTractorScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
