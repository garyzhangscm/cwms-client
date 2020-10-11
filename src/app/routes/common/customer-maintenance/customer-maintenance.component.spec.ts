import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonCustomerMaintenanceComponent } from './customer-maintenance.component';

describe('CommonCustomerMaintenanceComponent', () => {
  let component: CommonCustomerMaintenanceComponent;
  let fixture: ComponentFixture<CommonCustomerMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonCustomerMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonCustomerMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
