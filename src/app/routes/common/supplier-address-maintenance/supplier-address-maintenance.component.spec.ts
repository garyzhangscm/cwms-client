import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonSupplierAddressMaintenanceComponent } from './supplier-address-maintenance.component';

describe('CommonSupplierAddressMaintenanceComponent', () => {
  let component: CommonSupplierAddressMaintenanceComponent;
  let fixture: ComponentFixture<CommonSupplierAddressMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonSupplierAddressMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonSupplierAddressMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
