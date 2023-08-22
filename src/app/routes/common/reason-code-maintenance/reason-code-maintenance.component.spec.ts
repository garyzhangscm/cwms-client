import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonReasonCodeMaintenanceComponent } from './reason-code-maintenance.component';

describe('CommonReasonCodeMaintenanceComponent', () => {
  let component: CommonReasonCodeMaintenanceComponent;
  let fixture: ComponentFixture<CommonReasonCodeMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonReasonCodeMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonReasonCodeMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
