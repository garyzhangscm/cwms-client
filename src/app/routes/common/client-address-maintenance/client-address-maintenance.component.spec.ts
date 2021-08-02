import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonClientAddressMaintenanceComponent } from './client-address-maintenance.component';

describe('CommonClientAddressMaintenanceComponent', () => {
  let component: CommonClientAddressMaintenanceComponent;
  let fixture: ComponentFixture<CommonClientAddressMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonClientAddressMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonClientAddressMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
