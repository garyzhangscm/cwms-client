import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonCustomerMaintenanceConfirmComponent } from './customer-maintenance-confirm.component';

describe('CommonCustomerMaintenanceConfirmComponent', () => {
  let component: CommonCustomerMaintenanceConfirmComponent;
  let fixture: ComponentFixture<CommonCustomerMaintenanceConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonCustomerMaintenanceConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonCustomerMaintenanceConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
