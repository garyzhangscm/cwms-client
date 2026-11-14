import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonSupplierMaintenanceConfirmComponent } from './supplier-maintenance-confirm.component';

describe('CommonSupplierMaintenanceConfirmComponent', () => {
  let component: CommonSupplierMaintenanceConfirmComponent;
  let fixture: ComponentFixture<CommonSupplierMaintenanceConfirmComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonSupplierMaintenanceConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonSupplierMaintenanceConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
