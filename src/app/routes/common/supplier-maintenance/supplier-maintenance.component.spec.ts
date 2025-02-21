import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonSupplierMaintenanceComponent } from './supplier-maintenance.component';

describe('CommonSupplierMaintenanceComponent', () => {
  let component: CommonSupplierMaintenanceComponent;
  let fixture: ComponentFixture<CommonSupplierMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonSupplierMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonSupplierMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
