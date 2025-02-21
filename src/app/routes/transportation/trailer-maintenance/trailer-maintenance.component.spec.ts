import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonTrailerMaintenanceComponent } from './trailer-maintenance.component';

describe('CommonTrailerMaintenanceComponent', () => {
  let component: CommonTrailerMaintenanceComponent;
  let fixture: ComponentFixture<CommonTrailerMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonTrailerMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonTrailerMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
