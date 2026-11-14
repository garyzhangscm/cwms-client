import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilSystemControlledNumberMaintenanceComponent } from './system-controlled-number-maintenance.component';

describe('UtilSystemControlledNumberMaintenanceComponent', () => {
  let component: UtilSystemControlledNumberMaintenanceComponent;
  let fixture: ComponentFixture<UtilSystemControlledNumberMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilSystemControlledNumberMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilSystemControlledNumberMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
