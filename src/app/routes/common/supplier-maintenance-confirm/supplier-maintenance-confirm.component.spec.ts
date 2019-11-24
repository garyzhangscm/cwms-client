import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonSupplierMaintenanceConfirmComponent } from './supplier-maintenance-confirm.component';

describe('CommonSupplierMaintenanceConfirmComponent', () => {
  let component: CommonSupplierMaintenanceConfirmComponent;
  let fixture: ComponentFixture<CommonSupplierMaintenanceConfirmComponent>;

  beforeEach(async(() => {
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
