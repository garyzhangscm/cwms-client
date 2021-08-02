import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonClientMaintenanceComponent } from './client-maintenance.component';

describe('CommonClientMaintenanceComponent', () => {
  let component: CommonClientMaintenanceComponent;
  let fixture: ComponentFixture<CommonClientMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonClientMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonClientMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
